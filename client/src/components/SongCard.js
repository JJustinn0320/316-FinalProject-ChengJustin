import * as React from 'react';
import { useState, useContext, useEffect, useRef } from 'react'

import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function SongCard(props){
    const { song, onEdit, onClick, selected, onDelete } = props;
    
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [playlistAnchorEl, setPlaylistAnchorEl] = useState(null);
    const playlistOpen = Boolean(playlistAnchorEl);
    const handlePlaylistMenuClose = () => {
        setPlaylistAnchorEl(null);
    };

    // const openEditSongModal = () => {
    //     console.log(song._id)
    //     store.openModal(CurrentModal.EDIT_SONG)
    //     handleEditSong()
    // }

    // const handleRemoveFromCatalog = () => {
    //     console.log('delete')
    // }

    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext)

    const hasLoaded = useRef(false); // Track if we've already loaded
    
    useEffect(() => {
        // Only load once
        if (store && !hasLoaded.current) {
            hasLoaded.current = true;
            store.loadPlaylistArray();
            console.log(store.playlistArray)
        }
        
    }, [store]);

    const handleAddToPlaylistClick = (event) => {
        // Load user's playlists
        loadUserPlaylists();
        // Open submenu
        setPlaylistAnchorEl(event.currentTarget);
    };
    const loadUserPlaylists = async () => {
        try {
            // Filter to user's playlists only
            const userPlaylists = store.playlistArray?.filter(
                playlist => playlist.ownerEmail === auth.user?.email
            );
            console.log(userPlaylists)
        } catch (error) {
            console.error("Error loading playlists:", error);
        } 
    };

    const listItems = store.playlistArray
        ?.filter((playlist) => (playlist.ownerEmail === auth.user?.email))
        ?.map((playlist) => (
            <MenuItem 
                key={playlist._id}
                onClick={() => handleSelectPlaylist(playlist._id)}
                disabled={playlist.songs?.includes(song._id)}
            >
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    width: '100%'
                }}>
                    <Typography noWrap>
                        {playlist.name}
                    </Typography>
                    {playlist.songs?.includes(song._id) && (
                        <Typography variant="caption" color="text.secondary">
                            ✓
                        </Typography>
                    )}
                </Box>
            </MenuItem> ))

    const handleSelectPlaylist = async (PlaylistId) => {
        console.log(`adding song:${song._id} to playlist:`+ PlaylistId)
        try{
            const response = await store.addSongToPlaylist(PlaylistId, song._id)

            if(response.success){
                console.log('song added to playlist')
                setSnackbar({
                    open: true,
                    message: `"${song.title}" added to playlist successfully!`,
                    severity: 'success'
                });
            }
            else {
                setSnackbar({
                    open: true,
                    message: `Failed: ${response.message}`,
                    severity: 'error'
                });
            } 
        }
        catch (error) {
            setSnackbar({
                open: true,
                message: `Error: ${error.message}`,
                severity: 'error'
            });
        }  
    }

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // 'success' | 'error' 
    })

    return (
        <ListItem
            id={song._id}
            key={song._id}
        >
            <Box 
                onClick={onClick}
                sx={{ 
                    border: selected ? '3px solid #d38919ff' : '1px solid #ccc',
                    flexGrow: 1,
                    backgroundColor: '#ebc55eff',
                    p:2,
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'border 0.8',
                    '&:hover': {
                        borderColor: '#d38919ff',
                    }
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Typography sx={{ 
                        p: 1, 
                        fontWeight: 'Bold'
                    }}>{song.title} by {song.artist} ({song.year})</Typography>

                    <div>
                        <IconButton
                            id="long-button"
                            onClick={handleClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            slotProps={{
                            paper: {
                                style: {
                                maxHeight: 48 * 4.5,
                                width: '25ch',
                                },
                            },
                            list: {
                                'aria-labelledby': 'long-button',
                            },
                            }}
                        >
                            
                            <MenuItem 
                                onClick={handleAddToPlaylistClick}
                            >
                                Add to Playlist
                            </MenuItem>
                            <MenuItem onClick={onEdit}>Edit Song</MenuItem>
                            <MenuItem onClick={onDelete}>Remove from Catalog</MenuItem>
                        </Menu>
                        <Menu
                            id="playlist-submenu"
                            anchorEl={playlistAnchorEl}
                            open={playlistOpen}
                            onClose={handlePlaylistMenuClose}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            sx={{ 
                                '& .MuiPaper-root': {
                                    maxHeight: 200,
                                    width: 200,
                                }
                            }}
                        >
                            {listItems}
                        </Menu>

                    </div>
                </Box>
                
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Typography>Listens: {song.listens}</Typography>
                    <Typography>Playlists: {song.playlists}</Typography>
                </Box>
            </Box>
            <Snackbar 
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </ListItem>
    )
}