import { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { Copyright, ClearableTextField, MUIErrorModal } from './index'
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from'@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

const avatarButtonStyle = {
    color: "white", 
    backgroundColor: "#6200ea", 
    fontSize: 14,
    minWidth: 100,
    '&:hover': {
        backgroundColor: '#3700b3',
    }
}

export default function EditAccountScreen(){
    const { auth } = useContext(AuthContext)
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    function handleSubmit(event){
        event.preventDefault();
        console.log("Form Data:", formData);

        auth.updateUser(
            formData.username,
            formData.email,
            "formData.avatar",
            formData.password,
            formData.passwordConfirm
        );
    }

    let modalJSX = ""
    if (auth.errorMessage !== null){
        modalJSX = <MUIErrorModal />;
    }

    const navigate = useNavigate();

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [imageError, setImageError] = useState('');
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Reset error
        setImageError('');

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setImageError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            setImageError('Image size must be less than 2MB');
            return;
        }

        // Create preview URL for display
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            // The result is a base64 string
            const base64String = reader.result;
            setFormData(prev => ({
                ...prev,
                avatar: base64String
            }));
        };
        reader.onerror = () => {
            setImageError('Failed to read the image file');
        };
        reader.readAsDataURL(file);
    };

    const handleSelectButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, avatar: '' }));
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview); // Clean up memory
        }
        setAvatarPreview(null);
        setImageError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    const buttonStyle = {
        color: "white", 
        backgroundColor: "#505050", 
        fontSize: 15,
        minWidth: 190
    }
    return (
        <div id="register-screen">
            <center>
                <LockOutlinedIcon sx={{
                    mt:  5,
                    fontSize: 60
                }}/>
                <h1>Edit Account</h1>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <Box 
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ width: 400, margin: '0 auto' }}
                >
                    <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 2 
                        }}>
                            <Box sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                backgroundColor: '#f5f5f5',
                                border: '2px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                mb: 2,
                                position: 'relative'
                            }}>
                                {avatarPreview ? (
                                    <img 
                                        src={avatarPreview} 
                                        alt="Avatar preview" 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <AccountCircleIcon sx={{ fontSize: 80, color: '#999' }} />
                                )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Button
                                    startIcon={<AddPhotoAlternateIcon />}
                                    onClick={handleSelectButtonClick}
                                    sx={avatarButtonStyle}
                                    variant="contained"
                                >
                                    Select Avatar
                                </Button>
                                
                                {avatarPreview && (
                                    <Button
                                        startIcon={<DeleteIcon />}
                                        onClick={handleRemoveImage}
                                        sx={{
                                            ...avatarButtonStyle,
                                            backgroundColor: '#f44336',
                                            '&:hover': {
                                                backgroundColor: '#d32f2f',
                                            }
                                        }}
                                        variant="contained"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Box>
                            
                            {imageError && (
                                <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
                                    {imageError}
                                </Alert>
                            )}
                            
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Select a profile picture (optional, max 2MB)
                            </Typography>
                        </Box>
                    <Stack spacing={2}>
                        <ClearableTextField
                            required
                            name="username"
                            label="Username"
                            autoComplete='username'
                            value={formData.username}
                            onChange={handleChange('username')}
                        />
                        <ClearableTextField
                            required
                            name="email"
                            label="Email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                        />
                        <ClearableTextField 
                            required
                            name="password"
                            type="password"
                            label="Password"
                            autoComplete='new-password'
                            value={formData.password}
                            onChange={handleChange('password')}
                        />
                        <ClearableTextField 
                            required
                            name="passwordConfirm"
                            type="password"
                            label="Password Confirm"
                            autoComplete='new-password'
                            value={formData.passwordConfirm}
                            onChange={handleChange('passwordConfirm')}
                        />
                        <Box>
                            <Button 
                                type="submit" 
                                sx={{...buttonStyle, marginLeft: 'auto', mr: 1}}
                            >Complete</Button>
                            <Button
                                type="cancel"
                                sx={{...buttonStyle, marginRight: 'auto', ml: 1}}
                            >Cancel</Button>
                        </Box>
                    </Stack>
                </Box>
                <Copyright sx={{mt: '5', p: 5}}/>
                { modalJSX }
            </center>
        </div>
    )
}