import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Button from'@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function AppBanner(){
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)
    const handleAccount = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const navigate = useNavigate();
    function handleHome(){
        navigate('/')
    }
    function handlePlaylist(){
        navigate('/playlists/')
    }
    function handleSongs(){
        navigate('/songs/')
    }
    function handleLogin(){
        handleClose()
        navigate('/login/')
    }
    function handleRegister(){
        handleClose()
        navigate('/register/')
    }
    function handleEditAccount(){
        handleClose()
        navigate('/edit/')
    }
    function handleLogout(){
        handleClose()
        navigate('/')
    }
    

    const buttonStyle = {
        mr: 2, 
        border: '3px solid white', 
        color: "white", 
        fontSize: 12, 
        fontWeight: 'bold',
        minWidth: 100
    }
    return (
        <AppBar position='static' sx={{ backgroundColor: '#f26fcf' }}>
            <Toolbar variant='dense' sx={{ justifyContent: 'space-between' }}>
                <div>
                    <IconButton edge='start' aria-label="account-circle" onClick={handleHome}>
                        <HomeOutlinedIcon sx={{ border: '3.5px solid white', color: "white", fontSize: 40, borderRadius: '50%' }}/>
                    </IconButton>
                    <Button variant="text" sx={buttonStyle} onClick={handlePlaylist}>Playlists</Button>
                    <Button variant="text" sx={buttonStyle} onClick={handleSongs}>Songs Catalog</Button>
                    
                </div>
                <IconButton 
                    edge='end' 
                    aria-label="account-circle" 
                    onClick={handleAccount}
                >
                    <AccountCircleIcon sx={{ color: "#f26fcf", fontSize: 40, background: "white", borderRadius: '50%'}}/>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleLogin}>Login</MenuItem>
                    <MenuItem onClick={handleRegister}>Create Account</MenuItem>
                    <MenuItem onClick={handleEditAccount}>Edit Account</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}