import { useContext, useState, useEffect, useRef } from 'react';
import { CurrentModal, GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ReplayIcon from '@mui/icons-material/Replay';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    bgcolor: '#30c071ff',
    border: '2px solid #000',
    boxShadow: 24,
    borderRadius: 2,
    maxWidth: '90vw',
    maxHeight: '90vh',
    p: 3,
};

const getSongStyle = (isSelected, isPlaying) => ({
    border: isSelected ? '3px solid #d38919ff' : '1px solid #ccc',
    flexGrow: 1,
    backgroundColor: isPlaying ? '#ff9900' : isSelected ? '#ffd166' : '#ebc55eff',
    p: 2,
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    mb: 1,
    width: '90%',
    userSelect: 'none',
    '&:hover': {
        backgroundColor: isPlaying ? '#ffaa33' : isSelected ? '#ffe082' : '#f5d47b',
    },
});

export default function MUIPlayPlaylistModal(props) {
    const { playlist } = props;
    const { store } = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext)

    const [selectedSong, setSelectedSong] = useState(null);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [repeatMode, setRepeatMode] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const playerRef = useRef(null);
    const initializationComplete = useRef(false);

    const handleClose = () => {
        console.log('DEBUG: Closing modal, destroying player');
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
        }
        store.hideModals();
    };

    // Get current song index based on selected song
    const getCurrentSongIndex = () => {
        if (!selectedSong || !playlist?.songs) {
            console.log('DEBUG: getCurrentSongIndex - no selected song or playlist');
            return 0;
        }
        const index = playlist.songs.findIndex(song => song._id === selectedSong._id);
        console.log('DEBUG: getCurrentSongIndex - found index:', index, 'for song:', selectedSong.title);
        return index;
    };

    // Navigate to next song
    const playNextSong = () => {
        console.log('DEBUG: playNextSong called');
        if (!playlist?.songs?.length) {
            console.log('DEBUG: No songs in playlist');
            return;
        }

        const currentIndex = getCurrentSongIndex();
        let nextIndex = currentIndex + 1;

        console.log('DEBUG: Current index:', currentIndex, 'Next index:', nextIndex, 'Total songs:', playlist.songs.length);

        if (nextIndex >= playlist.songs.length) {
            if (repeatMode) {
                nextIndex = 0; // Loop back to first song
                console.log('DEBUG: Looping to first song (repeat mode)');
            } else {
                console.log('DEBUG: End of playlist, not repeating');
                return;
            }
        }

        const nextSong = playlist.songs[nextIndex];
        console.log('DEBUG: Next song selected:', nextSong.title, 'YouTube ID:', nextSong.youTubeId);
        
        setSelectedSong(nextSong);
        setCurrentSongIndex(nextIndex);
        
        if (playerRef.current && playerReady) {
            console.log('DEBUG: Loading next video into player:', nextSong.youTubeId);
            playerRef.current.loadVideoById(nextSong.youTubeId);
            if (isPlaying) {
                console.log('DEBUG: Auto-playing next song');
                setTimeout(() => playerRef.current.playVideo(), 1000);
            }
        } else {
            console.log('DEBUG: Player not ready or not available');
        }
    };

    // Navigate to previous song
    const playPreviousSong = () => {
        console.log('DEBUG: playPreviousSong called');
        if (!playlist?.songs?.length) return;

        const currentIndex = getCurrentSongIndex();
        let prevIndex = currentIndex - 1;

        console.log('DEBUG: Current index:', currentIndex, 'Previous index:', prevIndex);

        if (prevIndex < 0) {
            if (repeatMode) {
                prevIndex = playlist.songs.length - 1; // Loop to last song
                console.log('DEBUG: Looping to last song (repeat mode)');
            } else {
                console.log('DEBUG: Beginning of playlist, not repeating');
                return;
            }
        }

        const prevSong = playlist.songs[prevIndex];
        console.log('DEBUG: Previous song selected:', prevSong.title, 'YouTube ID:', prevSong.youTubeId);
        
        setSelectedSong(prevSong);
        setCurrentSongIndex(prevIndex);
        
        if (playerRef.current && playerReady) {
            console.log('DEBUG: Loading previous video into player:', prevSong.youTubeId);
            playerRef.current.loadVideoById(prevSong.youTubeId);
            if (isPlaying) {
                console.log('DEBUG: Auto-playing previous song');
                setTimeout(() => playerRef.current.playVideo(), 1000);
            }
        }
    };

    // Toggle play/pause
    const togglePlayPause = () => {
        console.log('DEBUG: togglePlayPause called. Current state:', isPlaying);
        if (!playerRef.current || !playerReady) {
            console.log('DEBUG: Player not ready or not available');
            return;
        }

        if (isPlaying) {
            console.log('DEBUG: Pausing video');
            playerRef.current.pauseVideo();
        } else {
            console.log('DEBUG: Playing video');
            playerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle song selection
    const handleSongSelect = (song, index) => {
        console.log('DEBUG: handleSongSelect called');
        console.log('DEBUG: Selected song:', song.title, 'Index:', index, 'YouTube ID:', song.youTubeId);
        console.log('DEBUG: Current selectedSong before update:', selectedSong?.title);
        console.log('DEBUG: Current isPlaying state:', isPlaying);
        console.log('DEBUG: Player ready state:', playerReady);
        
        setSelectedSong(song);
        setCurrentSongIndex(index);
        
        if (playerRef.current && playerReady) {
            console.log('DEBUG: Loading selected video into player:', song.youTubeId);
            playerRef.current.loadVideoById(song.youTubeId);
            if (isPlaying) {
                console.log('DEBUG: Auto-playing selected song');
                setTimeout(() => playerRef.current.playVideo(), 1000);
            } else {
                console.log('DEBUG: Not auto-playing (isPlaying is false)');
            }
        } else {
            console.log('DEBUG: Player not ready, will auto-play when ready');
            setIsPlaying(true); // Auto-play when selecting a song
        }
    };

    useEffect(() => {
        if (!selectedSong) return;
        console.log('incre')
        const userId = auth.user._id;

        // Increment PLAYLIST listens ONCE per user
        fetch(`/api/playlist-store/playlists/${playlist._id}/listen`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        // Increment SONG listens EVERY play
        fetch(`/api/song-store/songs/${selectedSong._id}/listen`, {
            method: "PUT"
        });

        // Load the selected song into YouTube player
        if (selectedSong.youtubeId && playerRef.current) {
            playerRef.current.loadVideoById(selectedSong.youtubeId);
        }
    }, [selectedSong]);

    // Initialize YouTube player
    useEffect(() => {
        console.log('DEBUG: useEffect for player initialization');
        console.log('DEBUG: Current modal state:', store.currentModal);
        console.log('DEBUG: Playlist data:', playlist);
        console.log('DEBUG: Playlist songs:', playlist?.songs);
        
        if (store.currentModal !== CurrentModal.PLAY_PLAYLIST) {
            console.log('DEBUG: Not in PLAY_PLAYLIST modal, skipping initialization');
            return;
        }

        // Prevent re-initialization
        if (initializationComplete.current) {
            console.log('DEBUG: Initialization already complete, skipping');
            return;
        }

        // Load YouTube IFrame API if not already loaded
        if (!window.YT) {
            console.log('DEBUG: Loading YouTube IFrame API');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Function to initialize player
        const initPlayer = () => {
            console.log('DEBUG: initPlayer function called');
            
            // Set first song as selected if none selected
            if (!selectedSong && playlist?.songs?.length > 0) {
                const firstSong = playlist.songs[0];
                console.log('DEBUG: Setting first song as selected:', firstSong.title);
                setSelectedSong(firstSong);
                setCurrentSongIndex(0);
            }

            const videoId = selectedSong?.youTubeId || playlist?.songs?.[0]?.youTubeId || 'Fpu5a0Bl8eY';
            console.log('DEBUG: Using videoId for player:', videoId);
            console.log('DEBUG: Selected song youtubeId:', selectedSong?.youTubeId);
            console.log('DEBUG: First song youtubeId:', playlist?.songs?.[0]?.youTubeId);

            // Destroy existing player if any
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                console.log('DEBUG: Destroying existing player');
                playerRef.current.destroy();
            }

            // Create new player
            console.log('DEBUG: Creating new YouTube player');
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '300',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'modestbranding': 1,
                    'rel': 0,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': (event) => {
                        console.log('DEBUG: YouTube Player onReady event fired');
                        console.log('DEBUG: Player video data:', event.target.getVideoData());
                        setPlayerReady(true);
                        initializationComplete.current = true;
                        
                        // Check what video is actually loaded
                        const currentVideoId = event.target.getVideoData()?.video_id;
                        console.log('DEBUG: Player loaded video ID:', currentVideoId);
                        console.log('DEBUG: Expected video ID:', videoId);
                        
                        // Auto-play if we have a valid video
                        if (currentVideoId && currentVideoId !== '') {
                            console.log('DEBUG: Auto-playing video');
                            event.target.playVideo();
                            setIsPlaying(true);
                        } else {
                            console.log('DEBUG: No valid video loaded, not auto-playing');
                        }
                    },
                    'onStateChange': (event) => {
                        console.log('DEBUG: Player state changed:', event.data);
                        console.log('DEBUG: Window.YT states:', {
                            UNSTARTED: window.YT?.PlayerState?.UNSTARTED,
                            ENDED: window.YT?.PlayerState?.ENDED,
                            PLAYING: window.YT?.PlayerState?.PLAYING,
                            PAUSED: window.YT?.PlayerState?.PAUSED,
                            BUFFERING: window.YT?.PlayerState?.BUFFERING,
                            CUED: window.YT?.PlayerState?.CUED
                        });
                        
                        // Handle player state changes
                        switch (event.data) {
                            case window.YT.PlayerState.PLAYING:
                                console.log('DEBUG: Video started playing');
                                setIsPlaying(true);
                                break;
                            case window.YT.PlayerState.PAUSED:
                                console.log('DEBUG: Video paused');
                                setIsPlaying(false);
                                break;
                            case window.YT.PlayerState.ENDED:
                                console.log('DEBUG: Video ended, playing next song');
                                // When song ends, play next song
                                playNextSong();
                                break;
                            default:
                                console.log('DEBUG: Other player state:', event.data);
                        }
                    },
                    'onError': (error) => {
                        console.error('DEBUG: YouTube Player Error:', error);
                        console.log('DEBUG: Error details:', error.data);
                    }
                }
            });
        };

        // Wait for YouTube API to be ready
        if (window.YT && window.YT.Player) {
            console.log('DEBUG: YouTube API already loaded, initializing player');
            setTimeout(() => {
                initPlayer();
            }, 100);
        } else {
            console.log('DEBUG: Setting up onYouTubeIframeAPIReady callback');
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        // Cleanup on unmount
        return () => {
            console.log('DEBUG: Cleanup function called');
            initializationComplete.current = false;
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                console.log('DEBUG: Destroying player on cleanup');
                playerRef.current.destroy();
                playerRef.current = null;
            }
            setPlayerReady(false);
            setIsPlaying(false);
            setSelectedSong(null);
        };
    }, [store.currentModal, playlist]);

    // Update player when selected song changes
    useEffect(() => {
        console.log('DEBUG: useEffect for selectedSong change');
        console.log('DEBUG: Selected song changed to:', selectedSong?.title);
        console.log('DEBUG: Selected song YouTube ID:', selectedSong?.youTubeId);
        console.log('DEBUG: Player ready:', playerReady);
        console.log('DEBUG: Player ref exists:', !!playerRef.current);
        
        if (selectedSong?.youTubeId && playerRef.current && playerReady) {
            console.log('DEBUG: Loading new video:', selectedSong.youTubeId);
            console.log('DEBUG: Current video data before load:', playerRef.current.getVideoData?.());
            
            playerRef.current.loadVideoById(selectedSong.youTubeId);
            if (isPlaying) {
                console.log('DEBUG: Auto-playing after load');
                setTimeout(() => {
                    console.log('DEBUG: Attempting to play video after timeout');
                    playerRef.current.playVideo();
                }, 1000);
            }
        } else {
            console.log('DEBUG: Conditions not met for loading video:', {
                hasYouTubeId: !!selectedSong?.youTubeId,
                hasPlayer: !!playerRef.current,
                playerReady: playerReady
            });
        }
    }, [selectedSong]);

    const songList = playlist?.songs?.map((song, index) => {
        const isSelected = selectedSong?._id === song._id;
        const isCurrentPlaying = isSelected && isPlaying;
        
        console.log('DEBUG: Rendering song:', song.title, 'Index:', index, 'isSelected:', isSelected, 'isCurrentPlaying:', isCurrentPlaying);
        
        return (
            <ListItem
                key={song._id || index}
                sx={{ ...getSongStyle(isSelected, isCurrentPlaying), maxWidth: '95%' }}
                onClick={() => {
                    console.log('DEBUG: Song clicked:', song.title, 'Index:', index);
                    handleSongSelect(song, index);
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography sx={{ fontWeight: 'bold', mr: 2, minWidth: '30px' }}>
                        {index + 1}.
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {song.title} {song.youTubeId ? `[${song.youTubeId}]` : '[No ID]'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            {song.artist} ({song.year})
                        </Typography>
                    </Box>
                    {isCurrentPlaying && (
                        <Box sx={{ ml: 2, animation: 'pulse 1.5s infinite' }}>
                            <PlayArrowIcon sx={{ color: '#d32f2f' }} />
                        </Box>
                    )}
                    {isSelected && !isCurrentPlaying && (
                        <Typography variant="caption" sx={{ ml: 2, color: '#666' }}>
                            Selected
                        </Typography>
                    )}
                </Box>
            </ListItem>
        );
    });

    // Add CSS for animation
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    console.log('DEBUG: Component render');
    console.log('DEBUG: Playlist name:', playlist?.name);
    console.log('DEBUG: Selected song state:', selectedSong?.title);
    console.log('DEBUG: Current song index:', currentSongIndex);
    console.log('DEBUG: Is playing:', isPlaying);
    console.log('DEBUG: Player ready:', playerReady);

    return (
        <Modal
            open={store.currentModal === CurrentModal.PLAY_PLAYLIST}
            onClose={handleClose}
        >
            <Box sx={{ ...style, height: '80vh', display: "flex", flexDirection: 'column' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🎵 Playing Playlist: {playlist?.name}
                </Typography>

                {/* Debug info */}
                {/* <Box sx={{ mb: 2, p: 1, bgcolor: '#00000011', borderRadius: 1, fontSize: '0.8rem' }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                        Selected: {selectedSong?.title || 'None'} | 
                        Playing: {isPlaying ? 'Yes' : 'No'} | 
                        Player: {playerReady ? 'Ready' : 'Loading'} | 
                        Song {currentSongIndex + 1} of {playlist?.songs?.length || 0}
                    </Typography>
                </Box> */}

                {/* Current Song Info */}
                {selectedSong && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#00000022', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                            Now Playing: {selectedSong.title} - {selectedSong.artist}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            YouTube ID: {selectedSong.youTubeId || 'No ID'} | 
                            Track {currentSongIndex + 1} of {playlist?.songs?.length || 0}
                        </Typography>
                    </Box>
                )}

                <Stack sx={{ flex: 1, overflow: 'hidden' }}>
                    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 3 }}>
                        {/* Song List */}
                        <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Playlist Songs ({playlist?.songs?.length || 0})
                            </Typography>
                            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                                {songList}
                            </List>
                        </Box>

                        {/* YouTube Player and Controls */}
                        <Box sx={{ flex: 1 }}>
                            {/* Player Controls */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, gap: 2 }}>
                                <IconButton
                                    onClick={() => {
                                        console.log('DEBUG: Previous button clicked');
                                        playPreviousSong();
                                    }}
                                    sx={{ backgroundColor: '#810fa3ff', color: 'white', '&:hover': { backgroundColor: '#6a0d8aff' } }}
                                    size="large"
                                    title="Previous Song"
                                >
                                    <SkipPreviousIcon />
                                </IconButton>

                                <IconButton
                                    onClick={() => {
                                        console.log('DEBUG: Play/Pause button clicked');
                                        togglePlayPause();
                                    }}
                                    sx={{ backgroundColor: '#d32f2f', color: 'white', '&:hover': { backgroundColor: '#b71c1c' } }}
                                    size="large"
                                    title={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                                </IconButton>

                                <IconButton
                                    onClick={() => {
                                        console.log('DEBUG: Next button clicked');
                                        playNextSong();
                                    }}
                                    sx={{ backgroundColor: '#810fa3ff', color: 'white', '&:hover': { backgroundColor: '#6a0d8aff' } }}
                                    size="large"
                                    title="Next Song"
                                >
                                    <SkipNextIcon />
                                </IconButton>
                            </Box>

                            {/* Repeat Toggle */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={repeatMode}
                                        onChange={(e) => {
                                            console.log('DEBUG: Repeat checkbox changed to:', e.target.checked);
                                            setRepeatMode(e.target.checked);
                                        }}
                                        icon={<ReplayIcon />}
                                        checkedIcon={<ReplayIcon sx={{ color: '#d32f2f' }} />}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 'bold', color: repeatMode ? '#d32f2f' : '#333' }}>
                                        {repeatMode ? 'Repeat: ON' : 'Repeat: OFF'}
                                    </Typography>
                                }
                                sx={{ mb: 2 }}
                            />

                            {/* YouTube Player */}
                            <Box sx={{ mt: 2 }}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "300px",
                                        backgroundColor: "#000",
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {!playerReady && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                backgroundColor: '#000'
                                            }}
                                        >
                                            <Typography>Loading YouTube Player...</Typography>
                                        </Box>
                                    )}
                                    <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
                                </Box>
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666', fontFamily: 'monospace' }}>
                                    Player Container ID: youtube-player
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Close Button */}
                    <Button
                        sx={{
                            mt: 3,
                            backgroundColor: "#810fa3ff",
                            color: "white",
                            alignSelf: 'flex-end',
                            '&:hover': {
                                backgroundColor: "#6a0d8aff"
                            }
                        }}
                        onClick={handleClose}
                    >
                        Close Player
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}