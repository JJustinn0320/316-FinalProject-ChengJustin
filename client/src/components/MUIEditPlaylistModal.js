import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

const getSongStyle = (isSelected, isDragging) => ({
    border: isSelected ? '3px solid #d38919ff' : isDragging ? '2px solid #810fa3ff' : '1px solid #ccc',
    flexGrow: 1,
    backgroundColor: isSelected ? '#ffd166' : '#ebc55eff',
    p: 2,
    borderRadius: 4,
    cursor: 'grab',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#d38919ff',
        backgroundColor: isSelected ? '#ffd166' : '#f8d686',
    },
    mb: 1,
    width: '90%',
    userSelect: 'none',
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
    const handleMusic = () => {
        navigate('/songs/')
    }

    const [selectedSong, setSelectedSong] = useState(null)
    const [error, setError] = useState(null)
    
    // Undo/Redo stack state
    const [undoStack, setUndoStack] = useState([])
    const [redoStack, setRedoStack] = useState([])
    const isProcessingRef = useRef(false) // Prevent adding to stack during undo/redo

    const [playlistName, setPlaylistName] = useState(playlist?.name)
    const [songs, setSongs] = useState([])

    useEffect(() => {
        if(playlist?.songs){
            setPlaylistName(playlist?.name || '');
            setSongs([...playlist.songs]);
            // Clear undo/redo stacks when opening modal
            setUndoStack([]);
            setRedoStack([]);
        }
    }, [playlist]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setPlaylistName(value)
    }

    // Add state change to undo stack
    const addToUndoStack = (action, previousState, newState, description) => {
        if (isProcessingRef.current) return;
        
        const undoItem = {
            action,
            previousState: [...previousState],
            newState: [...newState],
            description,
            timestamp: Date.now()
        };
        
        setUndoStack(prev => [...prev, undoItem]);
        setRedoStack([]); // Clear redo stack when new action is performed
    }

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        
        const lastAction = undoStack[undoStack.length - 1];
        isProcessingRef.current = true;
        
        // Restore previous state
        setSongs([...lastAction.previousState]);
        
        // Move from undo to redo stack
        setRedoStack(prev => [...prev, lastAction]);
        setUndoStack(prev => prev.slice(0, -1));
        
        isProcessingRef.current = false;
    }

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        
        const lastRedo = redoStack[redoStack.length - 1];
        isProcessingRef.current = true;
        
        // Restore the state that was undone
        setSongs([...lastRedo.newState]);
        
        // Move from redo back to undo stack
        setUndoStack(prev => [...prev, lastRedo]);
        setRedoStack(prev => prev.slice(0, -1));
        
        isProcessingRef.current = false;
    }

    const handleClose = async () => {
        // Send changes to database on close
        const updatedPlaylist = {
            ...playlist,
            name: playlistName,
            songs: songs
        };
        
        // Update in global store/database
        await store.editPlaylist(playlist._id, playlistName, songs);
        store.hideModals();
        setUndoStack([]);
        setRedoStack([]);
    };

    const handleDeleteSong = (event, songId, index) => {
        event.stopPropagation();
        
        const previousSongs = [...songs];
        const newSongs = [...songs];
        newSongs.splice(index, 1);
        
        // Add to undo stack
        addToUndoStack(
            'DELETE_SONG',
            previousSongs,
            newSongs,
            `Deleted "${songs[index].title}"`
        );
        
        setSongs(newSongs);
    };

    const handleCopy = (event, songId) => {
        event.stopPropagation();
        console.log('Copy song with ID:', songId);
        store.copySong(songId);
    };

    // Handle drag and drop
    const handleDragEnd = (result) => {
        const { destination, source } = result;
        
        // If dropped outside the list
        if (!destination) return;
        
        // If dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
        
        const previousSongs = [...songs];
        const newSongs = [...songs];
        
        // Remove from old position
        const [removed] = newSongs.splice(source.index, 1);
        // Insert at new position
        newSongs.splice(destination.index, 0, removed);
        
        // Add to undo stack
        addToUndoStack(
            'MOVE_SONG',
            previousSongs,
            newSongs,
            `Moved "${removed.title}" from position ${source.index + 1} to ${destination.index + 1}`
        );
        
        setSongs(newSongs);
    };

    // Song list with drag and drop support
    const songList = (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist-songs">
                {(provided, snapshot) => (
                    <List 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            minHeight: 350,
                            maxHeight: 500,
                            pl: 2
                        }}
                    >
                        {songs.map((song, index) => (
                            <Draggable 
                                key={`${song._id}-${index}`} 
                                draggableId={`${song._id}-${index}`} 
                                index={index}
                            >
                                {(provided, snapshot) => {
                                    const isSelected = selectedSong?._id === song._id;
                                    return (
                                        <ListItem 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={getSongStyle(isSelected, snapshot.isDragging)}
                                            onClick={() => setSelectedSong(song)}
                                        >
                                            <Box sx={{
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                width: '100%'
                                            }}>
                                                <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                                                    {/* Drag handle indicator */}
                                                    <Box sx={{ 
                                                        mr: 2, 
                                                        color: '#744601ff',
                                                        fontSize: '1.2rem',
                                                        cursor: 'grab'
                                                    }}>
                                                        ⋮⋮
                                                    </Box>
                                                    <Typography sx={{fontWeight: 'bold'}}>
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
                                }}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </List>
                )}
            </Droppable>
        </DragDropContext>
    );

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
                        }}
                    >
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
                    
                    {songList}
                    
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
                                disabled={undoStack.length === 0}
                            >
                                ↶Undo {undoStack.length > 0 ? `(${undoStack.length})` : ''}
                            </Button>
                            <Button 
                                onClick={handleRedo}
                                sx={buttonStyle}
                                disabled={redoStack.length === 0}
                            >
                                ↷Redo {redoStack.length > 0 ? `(${redoStack.length})` : ''}
                            </Button>
                        </Box>
                        <Button
                            sx={buttonStyle}
                            onClick={handleClose}
                        >
                            Save & Close
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Modal>
    )
}