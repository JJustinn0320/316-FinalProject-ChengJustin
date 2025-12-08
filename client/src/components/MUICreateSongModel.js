import { useContext, useState } from 'react'
import GlobalStoreContext from '../store';

import { ClearableTextField } from './index'

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

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

const buttonStyle = {
        mr: 2, 
        color: "white", 
        backgroundColor: "#1c1c1dff", 
        borderRadius: '16px',
        fontSize: 15,  
        minWidth: 100,
        maxHeight: 45,
    }

export default function MUIEditSongModal(props) {
    const { onCreateSong } = props

    const { store } = useContext(GlobalStoreContext);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        year: '',
        youTubeId: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleConfirm = async () => {
        setError(null); // Clear previous errors
        setLoading(true);

        console.log("Modal confirming with data:", formData);
        
        // Validate form first
        if (!formData.title || !formData.artist || !formData.year || !formData.youTubeId) {
            setError({
                title: "Validation Error",
                message: "Please fill in all fields",
                type: "VALIDATION_ERROR"
            });
            return;
        }

        // Call the parent's callback
        const result = await onCreateSong(formData);
        
        if (result.success) {
            console.log("Song created successfully!");
            // Reset form and close
            setFormData({
                title: '',
                artist: '',
                year: '',
                youTubeId: ''
            });
            setError(null); // Clear any previous errors
        } else {
            console.error("Failed to create song:", result);
            // Show error in modal
            setError({
                title: "Create Song Failed",
                message: result.message || "Unknown error",
                type: result.error || "UNKNOWN_ERROR"
            });
        }

        setLoading(false);
    };

    function handleCancelSong() {
        setFormData({
            title: '',
            artist: '',
            year: '',
            youTubeId: ''
        })
        store.hideModals();
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

    return (
        <Modal
            open={store.currentModal === "CREATE_SONG"}
        >
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
                        value={formData.title}
                        onChange={handleChange('title')}
                    />
                
                    <ClearableTextField 
                        name="artist"
                        label="Artist"
                        value={formData.artist}
                        onChange={handleChange('artist')}
                    />
                
                    <ClearableTextField 
                        name="year"
                        label="Year"
                        value={formData.year}
                        onChange={handleChange('year')}
                    />
                
                    <ClearableTextField 
                        name="youTubeId"
                        label="YouTubeId"
                        value={formData.youTubeId}
                        onChange={handleChange('youTubeId')}
                    />
            
                    <Box sx={{
                        display:"flex",
                        justifyContent: "space-between"
                    }}>
                        <Button sx={buttonStyle} disabled={loading} onClick={handleConfirm}>Confirm</Button>
                        <Button sx={buttonStyle} onClick={handleCancelSong}>Cancel</Button>
                    </Box> 
                </Stack>
            </Box>
        </Modal>
    );
}