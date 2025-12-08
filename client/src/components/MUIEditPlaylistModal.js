import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

import { CurrentModal, GlobalStoreContext } from '../store';

import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ClearableTextField from './ClearableTextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', 
    width: '70vw',
    bgcolor: '#30c071ff',
    border: '2px solid #000',
    boxShadow: 24,
    borderRadius: 2,
    maxWidth: '90vw',
    maxHeight: '90vh', 
}

const getSongStyle = (isSelected) => ({
    border: isSelected ? '3px solid #d38919ff' : '1px solid #ccc',
    flexGrow: 1,
    backgroundColor: isSelected ? '#ffd166' : '#ebc55eff', // Different color when selected
    p: 2,
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.3s ease', // Changed from 0.8 (seconds) to 0.3s
    '&:hover': {
        borderColor: '#d38919ff',
        backgroundColor: isSelected ? '#ffd166' : '#f8d686', // Keep or change hover color
    },
    mb: 1,
    width: '90%',
});

const buttonStyle = {
    mr: 2, 
    color: "white", 
    backgroundColor: "#810fa3ff", 
    borderRadius: '16px',
    fontSize: 15,  
    minWidth: 100,
    maxHeight: 45,
}

export default function MUIEditPlaylistModal(props) {
    const { playlist } = props
    const { store } = useContext(GlobalStoreContext)

    const navigate = useNavigate()
    const handleMusic  = () => {
        navigate('/songs/')
    }

    const [selectedSong, setSelectedSong] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if(playlist?.songs){
            setPlaylistName(playlist?.name || '');
            setSongs([...playlist.songs]);
        }
    }, [playlist]);

    const [playlistName, setPlaylistName] = useState(playlist?.name)
    const [songs, setSongs] = useState(null)

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setPlaylistName(value)
    }

    const handleRedo = () => {

    }
    const handleUndo = () => {
        
    }

    const handleClose = async () => {
        store.hideModals()
    };


    const handleDeleteSong = (event, songId, index) => {
        event.stopPropagation(); // Prevent ListItem onClick
        console.log('Delete song with ID:', songId);
        
        // Remove from local state
        const newSongs = [...songs];
        newSongs.splice(index, 1);
        setSongs(newSongs);
        
        // Add to transaction stack for undo/redo
        // store.addToTransactionStack(...)
    };

    const handleCopy = (event, songId) => {
        event.stopPropagation(); // Prevent ListItem onClick
        console.log('Copy song with ID:', songId);
        store.copySong(songId);
    };

    const songList = songs?.map((song, index) => {
        const isSelected = selectedSong?._id === song._id;
        return (
            <ListItem 
                key={`${song._id}-${index}`} 
                sx={getSongStyle(isSelected)}
                onClick={() => setSelectedSong(song)}
            >
                <Box sx={{
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <Box sx={{flexGrow: 1}}>
                        <Typography sx={{mr: 2, fontWeight: 'bold'}}>
                            {index + 1}. {song.title} by {song.artist} ({song.year})
                        </Typography>
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                        <Button 
                            onClick={(e) => handleCopy(e, song._id)} 
                            sx={{minWidth: 40, color:"#744601ff"}}
                            title="Copy Song"
                        >
                            ⧉
                        </Button>
                        <Button 
                            onClick={(e) => handleDeleteSong(e, song._id, index)} 
                            sx={{minWidth: 40, color:"#744601ff"}}
                            title="Remove from Playlist"
                        >
                            X
                        </Button>
                    </Box>
                </Box>
            </ListItem>
        );
    }) || null;

    return (
        <Modal open={store.currentModal === CurrentModal.EDIT_PLAYLIST}>
            <Box sx={{...style, height: error ? '70vh' : '60vh', display:"flex", flexDirection: 'column'}}>
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
                        Edit Playlist: {playlist?.name}
                    </Typography>
                </Box>
                <Stack sx={{ height: '100%' }}>
                    <Box 
                    sx={{
                            display:'flex',
                            justifyContent: 'space-between',
                            pl: 2
                        }}>
                        <ClearableTextField 
                            name="name"
                            label="name"
                            value={playlistName}
                            onChange={handleChange('name')}
                        />
                        <Button 
                            onClick={handleMusic}
                            sx={buttonStyle}
                            >+𝆕</Button>
                    </Box>
                    <List sx={{
                        flexgrow: 1,
                        overflow: 'auto',
                        minHeight: 350,
                        maxHeight: 500,
                        pl: 2
                        }}>
                        {songList}
                    </List>
                    <Box 
                        sx={{
                            display:'flex',
                            justifyContent: 'space-between',
                            p:2
                        }}
                    >
                        <Box>
                            <Button 
                                onClick={handleUndo}
                                sx={buttonStyle}
                                >
                            ↶Undo</Button>
                            <Button 
                                onClick={handleRedo}
                                sx={buttonStyle}
                                >
                            ↷Redo</Button>
                        </Box>
                        <Button
                            sx={buttonStyle}
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Modal>
    )
}