import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Button from'@mui/material/Button';
export default function AppBanner(){
    const navigate = useNavigate();
    function handleAccount(){
        console.log('clicked')
    }
    function handleHome(){
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
                    <Button variant="text" sx={buttonStyle}>Playlists</Button>
                    <Button variant="text" sx={buttonStyle}>Songs Catalog</Button>
                    
                </div>
                <IconButton edge='end' aria-label="account-circle" onClick={handleAccount}>
                    <AccountCircleIcon sx={{ color: "#f26fcf", fontSize: 40, background: "white", borderRadius: '50%'}}/>
                </IconButton>

                
                
            </Toolbar>
        </AppBar>
    )
}