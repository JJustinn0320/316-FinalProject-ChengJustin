import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import {Copyright, ClearableTextField, MUIErrorModal} from './index'
import AuthContext from '../auth'

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from'@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function RegisterScreen(){
    const { auth } = useContext(AuthContext);

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

        auth.registerUser(
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
    function handleLogin(){
        navigate('/login/')
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
                            name="username"
                            label="Username*"
                            autoComplete='username'
                            value={formData.username}
                            onChange={handleChange('username')}
                        />
                        <ClearableTextField
                            name="email"
                            label="Email*"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                        />
                        <ClearableTextField 
                            name="password"
                            type="password"
                            label="Password*"
                            autoComplete='new-password'
                            value={formData.password}
                            onChange={handleChange('password')}
                        />
                        <ClearableTextField 
                            name="passwordConfirm"
                            type="password"
                            label="Password Confirm*"
                            autoComplete='new-password'
                            value={formData.passwordConfirm}
                            onChange={handleChange('passwordConfirm')}
                        />
                        <Button 
                            type="submit"
                            fullWidth 
                            sx={buttonStyle}
                        >Create Account</Button>
                        <Box sx={{ textAlign: 'right' }}>
                            Already have an Account?
                            <Button onClick={handleLogin}>Sign In</Button>  
                        </Box>
                        
                    </Stack>
                </Box>
                <Copyright sx={{mt: '5', p: 5}}/>
                { modalJSX }
            </center>
        </div>
    )
}