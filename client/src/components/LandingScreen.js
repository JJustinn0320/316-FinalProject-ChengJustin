import { useNavigate } from 'react-router-dom'
import Button from'@mui/material/Button';

export default function LandingScreen() {
    const navigate = useNavigate();

    function handleGuest(){
        navigate('/playlists/')
    }
    function handleLogin(){
        navigate('/login/')
    }
    function handleRegister(){
        navigate('/register/')
    }
    
    const buttonStyle = {
        mr: 2, 
        color: "white", 
        backgroundColor: "#505050", 
        fontSize: 15, 
        fontWeight: 'bold', 
        minWidth: 150
    }
    return (
        <div id="landing-screen">
            <center>
                <h1>Playlister</h1>
                <Button variant="text" sx={buttonStyle} onClick={handleGuest}>Continue as Guest</Button>
                <Button variant="text" sx={buttonStyle} onClick={handleLogin}>Login</Button>
                <Button variant="text" sx={buttonStyle} onClick={handleRegister}>Create Account</Button>
            </center>
        </div>
    )
}