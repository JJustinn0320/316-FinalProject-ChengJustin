import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copyright, ClearableTextField } from './index'

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from'@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function EditAccountScreen(){
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
    }

    const navigate = useNavigate();
    function handleLogin(){
        navigate('/login/')
    }

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
                <Box 
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ width: 400, margin: '0 auto' }}
                >
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
            </center>
        </div>
    )
}