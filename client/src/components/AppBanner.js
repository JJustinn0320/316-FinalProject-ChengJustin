import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Button from'@mui/material/Button';
export default function AppBanner(){
    function handleAccountCircleClick(){
        console.log('clicked')
    }
    return (
        <AppBar position='static' sx={{ backgroundColor: '#d80ee3' }}>
            <Toolbar variant='dense' sx={{ justifyContent: 'space-between' }}>
                <div>
                    <IconButton edge='start' aria-label="account-circle">
                        <HomeOutlinedIcon sx={{ border: '3.5px solid white', color: "white", fontSize: 40, borderRadius: '50%' }}/>
                    </IconButton>
                    <Button variant="text" sx={{ mr: 2, border: '3px solid white', color: "white", fontSize: 12, fontWeight: 'bold'}}>Playlists</Button>
                    <Button variant="text" sx={{ mr: 2, border: '3px solid white', color: "white", fontSize: 12, fontWeight: 'bold'}}>Songs Catalog</Button>
                    
                </div>
                <IconButton edge='end' aria-label="account-circle" onClick={handleAccountCircleClick}>
                    <AccountCircleIcon sx={{ color: "#d80ee3", fontSize: 40, background: "white", borderRadius: '50%'}}/>
                </IconButton>

                
                
            </Toolbar>
        </AppBar>
    )
}