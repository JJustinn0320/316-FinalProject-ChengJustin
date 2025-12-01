import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function LoginScreen(){

    return (
        <div id="login-screen">
            <center>
                <LockOutlinedIcon sx={{
                    mt:  5,
                    fontSize: 60
                }}/>
                <h1>Sign In</h1>
            </center>
        </div>
    )
}