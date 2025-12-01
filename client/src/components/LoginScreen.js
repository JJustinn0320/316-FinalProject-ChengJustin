import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {Copyright, ClearableTextField} from './index'

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from'@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function RegisterScreen(){
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
    function handleRegister(){
        navigate('/register/')
    }

    const buttonStyle = {
        mr: 2, 
        color: "white", 
        backgroundColor: "#505050", 
        fontSize: 15,  
        minWidth: 150
    }
    return (
        <div id="register-screen">
            <center>
                <LockOutlinedIcon sx={{
                    mt:  5,
                    fontSize: 60
                }}/>
                <h1>Create Account</h1>
                <Box 
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ width: 400, margin: '0 auto' }}
                >
                    <Stack spacing={2}>
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
                            autoComplete='password'
                            value={formData.password}
                            onChange={handleChange('password')}
                        />
                        <Button 
                            type="submit"
                            fullWidth 
                            sx={buttonStyle}
                        >Sign In</Button>
                        <Box sx={{ textAlign: 'left' }}>
                            Dont have an Account?
                            <Button onClick={handleRegister}>Sign Up</Button>  
                        </Box>
                        
                    </Stack>
                </Box>
                <Copyright sx={{mt: '5', p: 5}}/>
            </center>
        </div>
    )
}