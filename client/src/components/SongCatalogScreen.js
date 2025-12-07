import { useState, useContext, useEffect, useRef } from 'react'

import { ClearableTextField, SongCard } from './index'
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import Box from "@mui/material/Box"
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';

export default function SongCatalogScreen() {
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
            store.loadSongArray();
        }
        
    }, [store]); // store in deps, but ref prevents re-fetching

    // Add new Song
    const handleNewSong = async () => {
        await store.createNewSong()
        store.loadSongArray();
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
        console.log(formData)
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
    const [filters, setFilters] = useState({
        showOnlyMine: true,
        playlistName: '',
        username: '',
        songTitle: '',
        songArtist: '',
        songYear: '',
        sortBy: 'name'
    })
    const listItems = store.songArray
        ?.filter((song) => {
            // Apply multiple filters
            let passes = true;
            // console.log(playlist)
            if (filters.showOnlyMine && auth.user?.email) {
                passes = passes && song.ownerEmail === auth.user.email;
            } 
            if (filters.songTitle) {
                const search = filters.songTitle.toLowerCase();
                passes = passes && song.name.toLowerCase().includes(search)
            }
            if (filters.songArtist) {
                const search = filters.songArtist.toLowerCase();
                passes = passes && song.name.toLowerCase().includes(search)
            }
            if (filters.songYear) {
                const search = filters.songYear.toLowerCase();
                passes = passes && song.name.toLowerCase().includes(search)
            }
            
            return passes;
        })
        ?.sort((a, b) => {
            return 0
        })
        ?.map((song) => (
            <SongCard
                key={song._id}
                song={song}
            />
        )) || null;

    const buttonStyle = {
        mr: 2, 
        color: "white", 
        backgroundColor: "#bd27bdff", 
        borderRadius: '16px',
        fontSize: 15,  
        minWidth: 100,
        maxHeight: 45,
    }

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
                        />
                        <ClearableTextField 
                            name="songArtist"
                            label="by Artist"
                            value={formData.songArtist}
                            onChange={handleChange('songArtist')}
                        />
                        <ClearableTextField 
                            name="SongYear"
                            label="by Year"
                            value={formData.SongYear}
                            onChange={handleChange('songYear')}
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
                        onClick={handleNewSong}
                    >⊕ New Playlist</Button>
                </Box>
            </Box>
        </div>
    )
}