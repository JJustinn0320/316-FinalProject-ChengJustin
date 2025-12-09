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
            sortBy: 'none' // Changed from 'name' to 'none'
        })
    }
    
    const handleSearch = () => {
        console.log(formData)
        setFilters({
            showOnlyMine: false,
            songTitle: formData.songTitle,
            songArtist: formData.songArtist,
            songYear: formData.songYear,
            sortBy: filters.sortBy || 'none'
        })
    }
    
    const [filters, setFilters] = useState({
        showOnlyMine: true,
        songTitle: '',
        songArtist: '',
        songYear: '',
        sortBy: 'none' // Changed from 'name' to 'none'
    })
    
    const handleCreateSong = async (songData) => {
        console.log("handleCreateSong called with:", songData);
        
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
            setError(null);
        } else {
            console.error("Failed to edit song:", result);
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
        setError(null);
    }

    const handleEditChange = (field) => (event) => {
        const value = event.target.value;
        
        if (field === 'year') {
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
            setError(null);
        } else {
            console.error("Failed to del song:", result);
            setError({
                title: "del Song Failed",
                message: result.message || "Unknown error",
                type: result.error || "UNKNOWN_ERROR"
            });
        }
    }

    const handleDeleteCancel = async () => {
        store.hideModals();
        setError(null);
    }

    const listItems = store.songArray
        ?.filter((song) => {
            let passes = true;
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
            if (!filters.sortBy || filters.sortBy === 'none') {
                return 0;
            }
            
            switch(filters.sortBy) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'artist-asc':
                    return a.artist.localeCompare(b.artist);
                case 'artist-desc':
                    return b.artist.localeCompare(a.artist);
                case 'year-hi-lo':
                    return (b.year || 0) - (a.year || 0);
                case 'year-lo-hi':
                    return (a.year || 0) - (b.year || 0);
                case 'listens-hi-lo':
                    return (b.listens || 0) - (a.listens || 0);
                case 'listens-lo-hi':
                    return (a.listens || 0) - (b.listens || 0);
                case 'playlists-hi-lo':
                    const bPlaylists = Array.isArray(b.playlists) ? b.playlists.length : (b.playlists || 0);
                    const aPlaylists = Array.isArray(a.playlists) ? a.playlists.length : (a.playlists || 0);
                    return bPlaylists - aPlaylists;
                case 'playlists-lo-hi':
                    const bPlaylists2 = Array.isArray(b.playlists) ? b.playlists.length : (b.playlists || 0);
                    const aPlaylists2 = Array.isArray(a.playlists) ? a.playlists.length : (a.playlists || 0);
                    return aPlaylists2 - bPlaylists2;
                case 'likes-hi-lo':
                    return (b.likes || 0) - (a.likes || 0);
                case 'likes-lo-hi':
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
                    store.openModal(CurrentModal.EDIT_SONG)
                }}
                onDelete={() => {
                    store.openModal(CurrentModal.DELETE_SONG)
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
                    gridTemplateColumns: '20% 40% 40%',
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
                
                {/* Sort Section */}
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '2/4',
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
                            {store.songArray?.[0]?.hasOwnProperty('likes') && (
                                <optgroup label="Likes">
                                    <option value="likes-hi-lo">Likes (Most First)</option>
                                    <option value="likes-lo-hi">Likes (Least First)</option>
                                </optgroup>
                            )}
                        </select>
                    </Box>
                    
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
                
                {/* Search Fields */}
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
                            name="songYear"  // Fixed: was "SongYear" should be "songYear"
                            label="by Year"
                            value={formData.songYear}
                            onChange={handleChange('songYear')}
                            onKeyDown={handleKeyDown}
                        />
                    </Stack>
                </Box>
                
                {/* Song List */}
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '2/3',
                    gridRow: '2/5',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <List 
                        spacing={2}
                        sx={{
                            overflowY: 'auto',
                            maxHeight: '60vh',
                            flexGrow: 1,
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
                    
                    {/* Show message if no songs found */}
                    {listItems && listItems.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
                            <Typography variant="body1">
                                No songs found matching your search criteria.
                            </Typography>
                            <Button 
                                sx={{ mt: 2 }}
                                onClick={handleClear}
                            >
                                Clear Search
                            </Button>
                        </Box>
                    )}
                </Box>
                
                {/* YouTube Player Preview */}
                <Box sx={{
                    border: '1px solid orange',
                    gridColumn: '3/4',
                    gridRow: '2/5',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {selectedSong ? `Preview: ${selectedSong.title}` : 'Select a Song'}
                    </Typography>
                    
                    {selectedSong?.youTubeId ? (
                        <Box sx={{ width: '100%', maxWidth: 560 }}>
                            <iframe
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${selectedSong.youTubeId}?autoplay=0&modestbranding=1&rel=0`}
                                title={`YouTube video player - ${selectedSong.title}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: '8px' }}
                            ></iframe>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {selectedSong.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {selectedSong.artist} ({selectedSong.year})
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
                                    YouTube ID: {selectedSong.youTubeId}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ 
                            width: '100%', 
                            height: 315, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px'
                        }}>
                            <Typography variant="body1" sx={{ color: '#999' }}>
                                {selectedSong 
                                    ? 'No YouTube ID available for this song' 
                                    : 'Click on a song to preview it here'}
                            </Typography>
                        </Box>
                    )}
                    
                    {/* Song Info (when selected) */}
                    {selectedSong && (
                        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px', width: '100%' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Song Details:
                            </Typography>
                            <Typography variant="body2">
                                <strong>Title:</strong> {selectedSong.title}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Artist:</strong> {selectedSong.artist}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Year:</strong> {selectedSong.year}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Listens:</strong> {selectedSong.listens || 0}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Playlists:</strong> {Array.isArray(selectedSong.playlists) ? selectedSong.playlists.length : selectedSong.playlists || 0}
                            </Typography>
                            {selectedSong.ownerEmail && (
                                <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                                    Added by: {selectedSong.ownerEmail}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
                
                {/* Search Buttons */}
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
                
                {/* New Song Button */}
                <Box sx={{
                    gridColumn: '2/4',
                    gridRow: '5',
                    display: 'flex'
                }}>
                    <Button 
                        sx={buttonStyle}
                        onClick={openCreateSongModal}
                    >⊕ New Song</Button>
                </Box>
                
            </Box>
            
            {/* Create Song Modal */}
            <MUICreateSongModal
                onCreateSong={handleCreateSong}
            />     
            
            {/* Edit Song Modal */}
            <Modal open={store.currentModal === CurrentModal.EDIT_SONG}>
                <Box sx={{...style, height: error ? 550 : 450,}}>
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
                    <Stack spacing={2} sx={{ p:4 }}>
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
                        <Box sx={{ display:"flex", justifyContent: "space-between" }}>
                            <Button sx={buttonStyle2} 
                                disabled={!editFormData.title || !editFormData.artist || !editFormData.year || !editFormData.youTubeId } 
                                onClick={handleConfirm}>Confirm</Button>
                            <Button sx={buttonStyle2} onClick={handleCancelSong}>Cancel</Button>
                        </Box> 
                    </Stack>
                </Box>
            </Modal> 
            
            {/* Delete Song Modal */}
            <Modal open={store.currentModal === CurrentModal.DELETE_SONG}>
                <Box sx={{...style, height: error ? 550 : 450, display:"flex", flexDirection: 'column'}}>
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
                    <Box sx={{ display:"flex", justifyContent: "space-between" }}>
                        <Button sx={{...buttonStyle2, p:2, ml:2, mb:2,}} onClick={handleDeleteConfirm}>Confirm</Button>
                        <Button sx={{...buttonStyle2, p:2, mr:2, mb:2,}} onClick={handleDeleteCancel}>Cancel</Button>
                    </Box> 
                </Box>
            </Modal>
        </div>
    )
}