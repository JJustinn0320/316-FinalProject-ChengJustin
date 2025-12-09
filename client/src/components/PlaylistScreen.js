import { useState, useContext, useEffect, useRef } from 'react'

import { ClearableTextField, MUIEditPlaylistModal, MUIPlayPlaylistModal , PlaylistCard } from './index'
import { CurrentModal, GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import Box from "@mui/material/Box"
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const buttonStyle = {
    mr: 2, 
    color: "white", 
    backgroundColor: "#bd27bdff", 
    borderRadius: '16px',
    fontSize: 15,  
    minWidth: 100,
    maxHeight: 45,
}
const buttonStyle2 = {
    mr: 2, 
    color: "white", 
    backgroundColor: "#1c1c1dff", 
    borderRadius: '16px',
    fontSize: 15,  
    minWidth: 100,
    maxHeight: 45,
    '&.Mui-disabled': {           
        color: '#888888',           // text color
        backgroundColor: '#cccccc', // grey background
    }
}
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', 
    width: 600,
    bgcolor: '#30c071ff',
    border: '2px solid #000',
    boxShadow: 24,
    borderRadius: 2,
    maxWidth: '90vw',
    maxHeight: '90vh', 
}

export default function PlaylistScreen() {
    const [formData, setFormData] = useState({
        playlistName: '',
        username: '',
        songTitle: '',
        songArtist: '',
        songYear: ''
    });

    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext)

    const hasLoaded = useRef(false); // Track if we've already loaded
    useEffect(() => {
        // Only load once
        if (store && !hasLoaded.current) {
            hasLoaded.current = true;
            store.loadPlaylistArray();
        }
        
    }, [store]); // store in deps, but ref prevents re-fetching

    const handleKeyDown = (event) => {
        if (event.key === 'Enter'){
            handleSearch()
        }
    }

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        
        if (field === 'songYear') {
            // Remove any non-digit characters
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [field]: numericValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    const handleClear = () => {
        setFormData({
            playlistName: '',
            username: '',
            songTitle: '',
            songArtist: '',
            songYear: ''
        })
        setFilters({
            showOnlyMine: true,
            playlistName: '',
            userName: '',
            songTitle: '',
            songArtist: '',
            songYear: '',
            sortBy: 'name'
        })
    }
    const handleSearch = () => {
        //console.log(formData)
        setFilters({
            showOnlyMine: false,
            playlistName: formData.playlistName,
            username: formData.username,
            songTitle: formData.songTitle,
            songArtist: formData.songArtist,
            songYear: formData.songYear,
            sortBy: 'name'
        })
    }
    const handleNewPlaylist = async () => {
        await store.createNewPlaylist()
        store.loadPlaylistArray();
    }
    const [selectedPlaylist, setSelectedPlaylist] = useState(null)
    const [error, setError] = useState(null)
    useEffect(() => {
        if (selectedPlaylist) {
            console.log(selectedPlaylist._id)
        }
    }, [selectedPlaylist]);
    const handleDeleteCancel = () => {
        store.hideModals();
        setError(null); // Clear any previous errors
    }
    const handleDeleteConfirm = async () => {
        const result = await store.deletePlaylist(selectedPlaylist?._id)
        if (result.success) {
            console.log("playlist del successfully!");
           
            setError(null); // Clear any previous errors
        } else {
            console.error("Failed to del playlist:", result);
            // Show error in modal
            setError({
                title: "del playlist Failed",
                message: result.message || "Unknown error",
                type: result.error || "UNKNOWN_ERROR"
            });
        }
    }
    const handleCopy = async (playlist) =>  {
        console.log('selected ' + selectedPlaylist?._id)
        console.log('playlist ' + playlist?._id)
        const result = await store.copyPlaylist(playlist?._id)
        if (result.success){
            console.log('playlist copyed successfully')
            setError(null)
        }
        else{
            setError({
                title: "del playlist Failed",
                message: result.message || "Unknown error",
                type: result.error || "UNKNOWN_ERROR"
            })
        }
    }
    const [filters, setFilters] = useState({
        showOnlyMine: true,
        playlistName: '',
        username: '',
        songTitle: '',
        songArtist: '',
        songYear: '',
        sortBy: 'name'
    })
    const listItems = store.playlistArray
        ?.filter((playlist) => {
            // Apply multiple filters
            let passes = true;
            // console.log(playlist)
            if (filters.showOnlyMine && auth.user?.email) {
                passes = passes && playlist.ownerEmail === auth?.user.email;
                //console.log(passes)
            } 
            if (filters.playlistName) {
                const search = filters.playlistName.toLowerCase();
                passes = passes && playlist.name.toLowerCase().includes(search)
            }
            if (filters.username) {
                const search = filters.username.toLowerCase();
                passes = passes && playlist.ownerUsername.toLowerCase().includes(search)
            }
            if (filters.songTitle) {
                const search = filters.songTitle.toLowerCase();
                // Check if any song in the playlist has a title that includes the search term
                const hasMatchingTitle = playlist.songs.some(song => 
                    song.title.toLowerCase().includes(search)
                );
                passes = passes && hasMatchingTitle;
            }
            if (filters.songArtist) {
                const search = filters.songArtist.toLowerCase();
                // Check if any song in the playlist has an artist that includes the search term
                const hasMatchingArtist = playlist.songs.some(song => 
                    song.artist.toLowerCase().includes(search)
                );
                passes = passes && hasMatchingArtist;
            }
            if (filters.songYear) {
                const search = filters.songYear.toLowerCase();
                // Check if any song in the playlist has a year that includes the search term
                const hasMatchingYear = playlist.songs.some(song => 
                    song.year.toString().toLowerCase().includes(search)
                );
                passes = passes && hasMatchingYear;
            }
            return passes;
        })
        ?.sort((a, b) => {
            // Default sort (no sorting)
            if (!filters.sortBy || filters.sortBy === 'none') {
                return 0;
            }
            
            switch(filters.sortBy) {
                case 'name-asc':
                    // A-Z by playlist name
                    return a.name.localeCompare(b.name);
                    
                case 'name-desc':
                    // Z-A by playlist name
                    return b.name.localeCompare(a.name);
                    
                case 'listens-hi-lo':
                    // Most listens first (HI-LO)
                    return (b.listens?.length || 0) - (a.listens?.length || 0);
                    
                case 'listens-lo-hi':
                    // Least listens first (LO-HI)
                    return (a.listens?.length || 0) - (b.listens?.length || 0);
                    
                case 'owner-asc':
                    // A-Z by owner username
                    return a.ownerUsername.localeCompare(b.ownerUsername);
                    
                case 'owner-desc':
                    // Z-A by owner username
                    return b.ownerUsername.localeCompare(a.ownerUsername);
                    
                case 'publish-date-newest':
                    // Newest first (assuming you have a createdAt or publishedDate field)
                    return new Date(b.published || b.createdAt || 0) - new Date(a.published || a.createdAt || 0);
                    
                case 'publish-date-oldest':
                    // Oldest first
                    return new Date(a.published || a.createdAt || 0) - new Date(b.published || b.createdAt || 0);
                    
                default:
                    return 0;
            }
        })
        ?.map((playlist) => (
            <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onDelete={(event) => {
                    event.stopPropagation()
                    setSelectedPlaylist(playlist)
                    store.openModal(CurrentModal.DELETE_PLAYLIST) // open edit modal
                }}
                onCopy={(event) => {
                    event.stopPropagation()
                    setSelectedPlaylist(playlist)
                    handleCopy(playlist)
                }}
                onPlay={(event) => {
                    event.stopPropagation()
                    setSelectedPlaylist(playlist)
                    store.openModal(CurrentModal.PLAY_PLAYLIST)
                }}
                onEdit={(event) => {
                    event.stopPropagation()
                    setSelectedPlaylist(playlist)
                    store.openModal(CurrentModal.EDIT_PLAYLIST)
                }}
                selected={selectedPlaylist?._id === playlist._id}
                onClick={(event) => {
                    setSelectedPlaylist(playlist)
                }}
            />
        )) || null;

    return (
        <div id="playlist-screen">
            <Box
                sx={{
                    p: 4,
                    display: 'grid',
                    gridTemplateColumns: '20% 80%',
                    gridTemplateRows: '5vh 30vh 10vh 25vh 10vh',
                    gap: 4,
                }}
            >
                <Box sx={{
                    gridColumn: '1/2',
                    gridRow: '1/2'
                }}>
                    <Typography variant="h2" sx={{
                        color: '#f26fcf'
                    }}>Playlists</Typography>
                </Box>
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '2/3',
                    gridRow: '1/2'
                }}>
                    {/*SORT*/}
                    <Box sx={{
                        border: '1px solid orange',
                        gridColumn: '2/3',
                        gridRow: '1/2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        p: 2,
                        gap: 2
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2 }}>
                            Sort By:
                        </Typography>
                        
                        <Box sx={{ minWidth: 200 }}>
                            <select 
                                value={filters.sortBy || 'none'}
                                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="none">No Sorting</option>
                                <optgroup label="Playlist Name">
                                    <option value="name-asc">A-Z (Ascending)</option>
                                    <option value="name-desc">Z-A (Descending)</option>
                                </optgroup>
                                <optgroup label="Listens">
                                    <option value="listens-hi-lo">Most Listens First (HI-LO)</option>
                                    <option value="listens-lo-hi">Least Listens First (LO-HI)</option>
                                </optgroup>
                                <optgroup label="Owner">
                                    <option value="owner-asc">Owner A-Z</option>
                                    <option value="owner-desc">Owner Z-A</option>
                                </optgroup>
                                <optgroup label="Date">
                                    <option value="publish-date-newest">Newest First</option>
                                    <option value="publish-date-oldest">Oldest First</option>
                                </optgroup>
                            </select>
                        </Box>
                        
                        {/* Display current sort info */}
                        {filters.sortBy && filters.sortBy !== 'none' && (
                            <Typography variant="caption" sx={{ color: '#666', ml: 2 }}>
                                {(() => {
                                    switch(filters.sortBy) {
                                        case 'name-asc': return 'Sorted: A-Z';
                                        case 'name-desc': return 'Sorted: Z-A';
                                        case 'listens-hi-lo': return 'Sorted: Most Listens';
                                        case 'listens-lo-hi': return 'Sorted: Least Listens';
                                        case 'owner-asc': return 'Sorted: Owner A-Z';
                                        case 'owner-desc': return 'Sorted: Owner Z-A';
                                        case 'publish-date-newest': return 'Sorted: Newest First';
                                        case 'publish-date-oldest': return 'Sorted: Oldest First';
                                        default: return '';
                                    }
                                })()}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{
                    gridColumn: '1/2',
                    gridRow: '2/3'
                }}>
                    <Stack spacing={4}>
                        <ClearableTextField 
                            name="playlistName"
                            label="by Playlist Name"
                            value={formData.playlistName}
                            onChange={handleChange('playlistName')}
                            onKeyDown={handleKeyDown}
                        />
                        <ClearableTextField 
                            name="username"
                            label="by User Name"
                            value={formData.username}
                            onChange={handleChange('username')}
                            onKeyDown={handleKeyDown}
                        />
                        <ClearableTextField 
                            name="songTitle"
                            label="by Song Title"
                            value={formData.songTitle}
                            onChange={handleChange('songTitle')}
                            onKeyDown={handleKeyDown}
                        />
                        <ClearableTextField 
                            name="songArtist"
                            label="by Song Artist"
                            value={formData.songArtist}
                            onChange={handleChange('songArtist')}
                            onKeyDown={handleKeyDown}
                        />
                        <ClearableTextField 
                            name="SongYear"
                            label="by Song Year"
                            value={formData.songYear}
                            onChange={handleChange('songYear')}
                            onKeyDown={handleKeyDown}
                        />
                    </Stack>
                </Box>
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '2',
                    gridRow: '2/5',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <List 
                        spacing={2}
                        sx={{
                            overflowY: 'auto', // Enable vertical scrolling
                            maxHeight: '60vh',
                            flexGrow: 1, // Take available space
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#888',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#555',
                            }
                        }}>
                        {listItems}
                    </List>
                </Box>
                <Box sx={{
                    mt: 2,
                    gridColumn: '1/2',
                    gridRow: '3/4', 
                    display: 'flex',
                    justifyContent: 'space-between',
                }}>
                    <Button 
                        sx={buttonStyle}
                        onClick={handleSearch}
                    >⌕ Search</Button>
                    <Button 
                        sx={buttonStyle}
                        onClick={handleClear}
                    >Clear</Button>
                </Box>
                <Box sx={{
                    gridColumn: '2/3',
                    gridRow: '5',
                    display: 'flex'
                }}>
                    <Button 
                        sx={buttonStyle}
                        onClick={handleNewPlaylist}
                    >⊕ New Playlist</Button>
                </Box>
            </Box>
            <Modal open={store.currentModal === CurrentModal.DELETE_PLAYLIST}>
                <Box sx={{...style, height: error ? 550 : 450, display:"flex", flexDirection: 'column'}}>
                    {/* Error Display */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 0}}>
                            <AlertTitle>{error.title}</AlertTitle>
                            {error.message}
                        </Alert>
                    )}
                    <Box sx={{
                        backgroundColor: '#035803ff',
                        color: 'white',
                        p: 2,
                        mb:1,
                    }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                            Delete Song
                        </Typography>
                        
                    </Box>
                    <Box sx={{flexGrow:1}}>
                        <Typography variant="h5" component="h2" sx={{ p:2, fontWeight: 'bold' }}>
                            Are you sure you want to remove the playlist {selectedPlaylist?.name} from the catalog 
                        </Typography>
                        <Typography sx={{p:2}}>
                            Doing so means it will be permanently removed
                        </Typography>
                    </Box>
                    <Box sx={{
                        display:"flex",
                        justifyContent: "space-between"
                    }}>
                        
                        <Button sx={{...buttonStyle2, p:2, ml:2, mb:2,}} onClick={handleDeleteConfirm}>Confirm</Button>
                        <Button sx={{...buttonStyle2, p:2, mr:2, mb:2,}} onClick={handleDeleteCancel}>Cancel</Button>
                    </Box> 
                </Box>
            </Modal>
            <MUIEditPlaylistModal 
                playlist={selectedPlaylist}
            />
            <MUIPlayPlaylistModal
                playlist={selectedPlaylist}
                />
        </div>
    )
}