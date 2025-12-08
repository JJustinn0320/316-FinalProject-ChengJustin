import { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import AuthContext from '../auth'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Button from'@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function AppBanner(){
    const { auth } = useContext(AuthContext)
    const location = useLocation()

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
        auth.logoutUser()
    }
    
    const buttonStyle = {
        // mr: 2, 
        border: '3px solid white', 
        color: "white", 
        fontSize: 12, 
        fontWeight: 'bold',
        minWidth: 100
    }

    const path = location.pathname

    let menuItems = ""
    if (auth.loggedIn){
        menuItems = 
            <div>
                <MenuItem onClick={handleEditAccount}>Edit Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </div>   
    }
    else{
        menuItems=
            <div>
                <MenuItem onClick={handleRegister}>Create Account</MenuItem>
                <MenuItem onClick={handleLogin}>Login</MenuItem>
            </div>
    }
    return (
        <AppBar position='static' sx={{ backgroundColor: '#f26fcf' }}>
            <Toolbar variant='dense' sx={{ justifyContent: 'space-between' }}>
                {/* Home + Catalog Buttons */}
                <Box sx={{
                    display: 'flex', 
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'flex-start'
                }}>
                    <IconButton edge='start' aria-label="account-circle" onClick={handleHome}>
                        <HomeOutlinedIcon sx={{ border: '3.5px solid white', color: "white", fontSize: 40, borderRadius: '50%' }}/>
                    </IconButton>
                    {auth.loggedIn && (
                        <Stack direction="row" spacing={1}>
                            <Button variant="text" sx={buttonStyle} onClick={handlePlaylist}>Playlists</Button>
                            <Button variant="text" sx={buttonStyle} onClick={handleSongs}>Songs Catalog</Button>
                        </Stack>
                    )}
                </Box>
                {/* Title */}
                <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    pointerEvents: 'none' // will block clicks if not none
                }}>
                    {auth.loggedIn && (path === '/edit') && <Typography sx={{fontWeight: 'bold', fontSize: 24,}}>The Playlister</Typography>}
                </Box>
                {/* Account Menu */}
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
                    {menuItems}
                </Menu>
            </Toolbar>
        </AppBar>
    )
}