import { useState, useContext, useEffect, useRef } from 'react'

import { ClearableTextField, PlaylistCard } from './index'
import { GlobalStoreContext } from '../store';

import Box from "@mui/material/Box"
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';

export default function PlaylistScreen() {
    const [formData, setFormData] = useState({
        playlistName: '',
        username: '',
        songTitle: '',
        songArtist: '',
        songYear: ''
    });

    const { store } = useContext(GlobalStoreContext);

    const hasLoaded = useRef(false); // Track if we've already loaded
    
    useEffect(() => {
        // Only load once
        if (store && !hasLoaded.current) {
            hasLoaded.current = true;
            store.loadIdNamePairs();
        }
    }, [store]); // store in deps, but ref prevents re-fetching

    const handleChange = (field) => (event) => {
        if (field === 'songYear'){
            if (/^\d*$/.test( event.target.value))
            setFormData(prev => ({
                ...prev,
                [field]: event.target.value
            }));
        }
        else{
            setFormData(prev => ({
                ...prev,
                [field]: event.target.value
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
    }

    const handleSearch = () => {
        console.log(formData)
    }

    const buttonStyle = {
        mr: 2, 
        color: "white", 
        backgroundColor: "#bd27bdff", 
        borderRadius: '16px',
        fontSize: 15,  
        minWidth: 100
    }
    const listItems = store?.idNamePairs?.map((pair) => (
        <PlaylistCard
            key={pair._id}
            idNamePair={pair}
            username={"hello"}
        />
    )) || null;

    return (
        <div id="playlist-screen">
            <Box
                sx={{
                    p: 4,
                    display: 'flex',
                    gap: 4,
                }}
            >
                <Box
                    sx={{
                        width: '30%',
                        p: 2
                    }}
                >
                    <Typography variant="h2" gutterBottom sx={{
                        mt: 2,
                        color: '#f26fcf'
                    }}>
                        Playlists
                    </Typography>
                    <Stack spacing={5}>
                        <ClearableTextField 
                            name="playlistName"
                            label="by Playlist Name"
                            value={formData.playlistName}
                            onChange={handleChange('playlistName')}
                        />
                        <ClearableTextField 
                            name="username"
                            label="by User Name"
                            value={formData.username}
                            onChange={handleChange('username')}
                        />
                        <ClearableTextField 
                            name="songTitle"
                            label="by Song Title"
                            value={formData.songTitle}
                            onChange={handleChange('songTitle')}
                        />
                        <ClearableTextField 
                            name="songArtist"
                            label="by Song Artist"
                            value={formData.songArtist}
                            onChange={handleChange('songArtist')}
                        />
                        <ClearableTextField 
                            name="SongYear"
                            label="by Song Year"
                            value={formData.SongYear}
                            onChange={handleChange('SongYear')}
                        />
                        <Box
                            sx={{
                                display: 'flex'
                            }}
                        >
                            <Button 
                                sx={{...buttonStyle, marginRight: 'auto', mr: 1}}
                                onClick={handleSearch}
                            >⌕ Search</Button>
                            <Button 
                                sx={{...buttonStyle, marginLeft: 'auto', mr: 1}}
                                onClick={handleClear}
                            >Clear</Button>
                        </Box>
                    </Stack>
                </Box>
                <Box
                    sx={{
                        backgroundColor: 'pink'
                    }}
                >
                    <List>
                        {listItems}
                    </List>
                </Box>
            </Box>
        </div>
    )
}