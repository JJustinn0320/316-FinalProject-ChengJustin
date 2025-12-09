import { useState, useContext, useEffect, useRef } from 'react'

import { ClearableTextField, SongCard, MUICreateSongModal } from './index'
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

export default function SongCatalogScreen() {
    const [formData, setFormData] = useState({
        songTitle: '',
        songArtist: '',
        songYear: ''
    });

    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext)

    // useEffect(() => {
    //     console.log("Store updated - songArray:", store.songArray);
    //     console.log("Number of songs:", store.songArray.length);
    // }, [store.songArray]);

    const hasLoaded = useRef(false); // Track if we've already loaded
    useEffect(() => {
        // Only load once
        if (store && !hasLoaded.current) {
            hasLoaded.current = true;
            store.loadSongArray();
        }
        
    }, [store]); // store in deps, but ref prevents re-fetching

    // Add new Song
    const openCreateSongModal = () => {
        store.openModal(CurrentModal.CREATE_SONG);
    }

    // SEARCH FILTERING
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
            songTitle: '',
            songArtist: '',
            songYear: ''
        })
        setFilters({
            showOnlyMine: true,
            songTitle: '',
            songArtist: '',
            songYear: '',
            sortBy: 'name'
        })
    }
    const handleSearch = () => {
        console.log(formData)
        setFilters({
            showOnlyMine: false,
            songTitle: formData.songTitle,
            songArtist: formData.songArtist,
            songYear: formData.songYear,
            sortBy: 'name'
        })
    }
    const [filters, setFilters] = useState({
        showOnlyMine: true,
        songTitle: '',
        songArtist: '',
        songYear: '',
        sortBy: 'name'
    })
    const handleCreateSong = async (songData) => {
        console.log("handleCreateSong called with:", songData);
        
        // Call store method
        const result = await store.createSong(
            songData.title,
            songData.artist,
            songData.year,
            songData.youTubeId
        );
        
        console.log("Store createSong result:", result);
        
        if (result.success) {
            
            console.log("Song created successfully:", result.song);
            store.hideModals();
            return { 
                success: true, 
                song: result.song 
            };
        } else {
            // Error - return it to modal
            console.log("Failed to create song:", result);
            return { 
                success: false, 
                error: result.error,
                message: result.message
            };
        }
    };

    
    const [selectedSong, setSelectedSong] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        artist: '',
        year: '',
        youTubeId: ''
    });

    const handleKeyDown = (event) => {
        if (event.key === 'Enter'){
            handleSearch()
        }
    }

    useEffect(() => {
        if (selectedSong) {
            console.log(selectedSong._id)
            setEditFormData({
                title: selectedSong.title,
                artist: selectedSong.artist,
                year: selectedSong.year,
                youTubeId: selectedSong.youTubeId
            });
        }
    }, [selectedSong]);

    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        console.log("handleConfirm (edit song)");
        console.log(editFormData)
        // Call store method
        const result = await store.editSong(
            selectedSong._id,
            editFormData.title,
            editFormData.artist,
            editFormData.year,
            editFormData.youTubeId
        );
        
        console.log("Store editSong result:", result);
        
        if (result.success) {
            console.log("Song edit successfully!");
           
            setError(null); // Clear any previous errors
        } else {
            console.error("Failed to edit song:", result);
            // Show error in modal
            setError({
                title: "Edit Song Failed",
                message: result.message || "Unknown error",
                type: result.error || "UNKNOWN_ERROR"
            });
        }
    }

    function handleCancelSong() {
        setEditFormData({
            title: '',
            artist: '',
            year: '',
            youTubeId: ''
        })
        store.hideModals();
        setError(null); // Clear any previous errors
    }

    const handleEditChange = (field) => (event) => {
        const value = event.target.value;
        
        if (field === 'year') {
            // Remove any non-digit characters
            const numericValue = value.replace(/\D/g, '');
            setEditFormData(prev => ({
                ...prev,
                [field]: numericValue
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleDeleteConfirm = async () => {
        console.log("handleDeleteConfirm");

        const result = await store.deleteSong(selectedSong._id)
        if (result.success) {
            console.log("Song del successfully!");
           
            setError(null); // Clear any previous errors
        } else {
            console.error("Failed to del song:", result);
            // Show error in modal
            setError({
                title: "del Song Failed",
                message: result.message || "Unknown error",
                type: result.error || "UNKNOWN_ERROR"
            });
        }
    }

    const handleDeleteCancel = async () => {
        store.hideModals();
        setError(null); // Clear any previous errors
    }

    const listItems = store.songArray
        ?.filter((song) => {
            // Apply multiple filters
            let passes = true;
            // console.log(song)
            if (filters.showOnlyMine && auth.user?.email) {
                passes = passes && song.ownerEmail === auth.user.email;
            } 
            if (filters.songTitle) {
                const search = filters.songTitle.toLowerCase();
                passes = passes && song.title.toLowerCase().includes(search)
            }
            if (filters.songArtist) {
                const search = filters.songArtist.toLowerCase();
                passes = passes && song.artist.toLowerCase().includes(search)
            }
            if (filters.songYear) {
                const search = filters.songYear.toLowerCase();
                passes = passes && (''+song.year).includes(search)
            }
            
            return passes;
        })
        ?.sort((a, b) => {
            // Default sort (no sorting)
            if (!filters.sortBy || filters.sortBy === 'none') {
                return 0;
            }
            
            switch(filters.sortBy) {
                case 'title-asc':
                    // A-Z by song title
                    return a.title.localeCompare(b.title);
                    
                case 'title-desc':
                    // Z-A by song title
                    return b.title.localeCompare(a.title);
                    
                case 'artist-asc':
                    // A-Z by artist name
                    return a.artist.localeCompare(b.artist);
                    
                case 'artist-desc':
                    // Z-A by artist name
                    return b.artist.localeCompare(a.artist);
                    
                case 'year-hi-lo':
                    // Newest year first (HI-LO)
                    return (b.year || 0) - (a.year || 0);
                    
                case 'year-lo-hi':
                    // Oldest year first (LO-HI)
                    return (a.year || 0) - (b.year || 0);
                    
                case 'listens-hi-lo':
                    // Most listens first (HI-LO) - assuming listens is a number
                    return (b.listens || 0) - (a.listens || 0);
                    
                case 'listens-lo-hi':
                    // Least listens first (LO-HI)
                    return (a.listens || 0) - (b.listens || 0);
                    
                case 'playlists-hi-lo':
                    // Most playlists first (HI-LO) - assuming song.playlists is an array or number
                    const bPlaylists = Array.isArray(b.playlists) ? b.playlists.length : (b.playlists || 0);
                    const aPlaylists = Array.isArray(a.playlists) ? a.playlists.length : (a.playlists || 0);
                    return bPlaylists - aPlaylists;
                    
                case 'playlists-lo-hi':
                    // Least playlists first (LO-HI)
                    const bPlaylists2 = Array.isArray(b.playlists) ? b.playlists.length : (b.playlists || 0);
                    const aPlaylists2 = Array.isArray(a.playlists) ? a.playlists.length : (a.playlists || 0);
                    return aPlaylists2 - bPlaylists2;
                    
                case 'likes-hi-lo':
                    // Most likes first - if you have a likes field
                    return (b.likes || 0) - (a.likes || 0);
                    
                case 'likes-lo-hi':
                    // Least likes first
                    return (a.likes || 0) - (b.likes || 0);
                    
                default:
                    return 0;
            }
        })
        ?.map((song) => (
            <SongCard
                key={song._id}
                song={song}
                onClick={() => setSelectedSong(song)}
                onEdit={() => {
                    store.openModal(CurrentModal.EDIT_SONG) // open edit modal
                }}
                onDelete={() => {
                    store.openModal(CurrentModal.DELETE_SONG) // open edit modal
                }}
                selected={selectedSong?._id === song._id}
            />
        )) || null;
    return (
        <div id="songs-catalog-screen">
            <Box
                sx={{
                    p: 4,
                    display: 'grid',
                    gridTemplateColumns: '20% 80%',
                    gridTemplateRows: '5vh 20vh 20vh 25vh 10vh',
                    gap: 4,
                }}
            >
                <Box sx={{
                    gridColumn: '1/2',
                    gridRow: '1/2'
                }}>
                    <Typography variant="h2" sx={{
                        color: '#f26fcf'
                    }}>Songs</Typography>
                </Box>
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '2/3',
                    gridRow: '1/2'
                }}>
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
                            Sort Songs By:
                        </Typography>
                        
                        <Box sx={{ minWidth: 220 }}>
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
                                <optgroup label="Title">
                                    <option value="title-asc">Title A-Z</option>
                                    <option value="title-desc">Title Z-A</option>
                                </optgroup>
                                <optgroup label="Artist">
                                    <option value="artist-asc">Artist A-Z</option>
                                    <option value="artist-desc">Artist Z-A</option>
                                </optgroup>
                                <optgroup label="Year">
                                    <option value="year-hi-lo">Year (Newest First)</option>
                                    <option value="year-lo-hi">Year (Oldest First)</option>
                                </optgroup>
                                <optgroup label="Listens">
                                    <option value="listens-hi-lo">Listens (Most First)</option>
                                    <option value="listens-lo-hi">Listens (Least First)</option>
                                </optgroup>
                                <optgroup label="Playlists">
                                    <option value="playlists-hi-lo">Playlists (Most First)</option>
                                    <option value="playlists-lo-hi">Playlists (Least First)</option>
                                </optgroup>
                                {/* Optional: Add likes if your songs have likes */}
                                {store.songArray?.[0]?.hasOwnProperty('likes') && (
                                    <optgroup label="Likes">
                                        <option value="likes-hi-lo">Likes (Most First)</option>
                                        <option value="likes-lo-hi">Likes (Least First)</option>
                                    </optgroup>
                                )}
                            </select>
                        </Box>
                        
                        {/* Display current sort info */}
                        {filters.sortBy && filters.sortBy !== 'none' && (
                            <Typography variant="caption" sx={{ color: '#666', ml: 2 }}>
                                {(() => {
                                    switch(filters.sortBy) {
                                        case 'title-asc': return 'Sorted: Title A-Z';
                                        case 'title-desc': return 'Sorted: Title Z-A';
                                        case 'artist-asc': return 'Sorted: Artist A-Z';
                                        case 'artist-desc': return 'Sorted: Artist Z-A';
                                        case 'year-hi-lo': return 'Sorted: Year (Newest)';
                                        case 'year-lo-hi': return 'Sorted: Year (Oldest)';
                                        case 'listens-hi-lo': return 'Sorted: Most Listens';
                                        case 'listens-lo-hi': return 'Sorted: Least Listens';
                                        case 'playlists-hi-lo': return 'Sorted: Most Playlists';
                                        case 'playlists-lo-hi': return 'Sorted: Least Playlists';
                                        case 'likes-hi-lo': return 'Sorted: Most Likes';
                                        case 'likes-lo-hi': return 'Sorted: Least Likes';
                                        default: return '';
                                    }
                                })()}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '1/2',
                    gridRow: '2/3'
                }}>
                    <Stack spacing={4}>
                        <ClearableTextField 
                            name="songTitle"
                            label="by Title"
                            value={formData.songTitle}
                            onChange={handleChange('songTitle')}
                            onKeyDown={handleKeyDown}
                        />
                        <ClearableTextField 
                            name="songArtist"
                            label="by Artist"
                            value={formData.songArtist}
                            onChange={handleChange('songArtist')}
                            onKeyDown={handleKeyDown}
                        />
                        <ClearableTextField 
                            name="SongYear"
                            label="by Year"
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
                        onClick={openCreateSongModal}
                    >⊕ New Song</Button>
                </Box>
                
            </Box>
            <MUICreateSongModal
                onCreateSong={handleCreateSong}
            />     
            <Modal open={store.currentModal === CurrentModal.EDIT_SONG}>
                <Box sx={{...style, height: error ? 550 : 450,}}>
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
                            Edit Song
                        </Typography>
                    </Box>
                    <Stack spacing={2} sx={{
                        p:4
                    }}>
                        <ClearableTextField 
                            name="title"
                            label="Title"
                            value={editFormData.title}
                            onChange={handleEditChange('title')}
                        
                        />
                    
                        <ClearableTextField 
                            name="artist"
                            label="Artist"
                            value={editFormData.artist}
                            onChange={handleEditChange('artist')}
                            
                        />
                    
                        <ClearableTextField 
                            name="year"
                            label="Year"
                            value={editFormData.year}
                            onChange={handleEditChange('year')}
                          
                        />
                    
                        <ClearableTextField 
                            name="youTubeId"
                            label="YouTubeId"
                            value={editFormData.youTubeId}
                            onChange={handleEditChange('youTubeId')}
                         
                        />
                
                        <Box sx={{
                            display:"flex",
                            justifyContent: "space-between"
                        }}>
                            <Button sx={buttonStyle2} 
                                disabled={!editFormData.title || !editFormData.artist || !editFormData.year || !editFormData.youTubeId } 
                                onClick={handleConfirm}>Confirm</Button>
                            <Button sx={buttonStyle2} onClick={handleCancelSong}>Cancel</Button>
                        </Box> 
                    </Stack>
                </Box>
            </Modal> 
            <Modal open={store.currentModal === CurrentModal.DELETE_SONG}>
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
                            Are you sure you want to remove the song {selectedSong?.title} from the catalog 
                        </Typography>
                        <Typography sx={{p:2}}>
                            Doing so will remove it from all of you playlists
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
        </div>
    )
}