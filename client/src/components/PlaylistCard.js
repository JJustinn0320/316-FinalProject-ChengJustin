
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';

export default function PlaylistCard(props){

    const { idNamePair, username } = props;
    return (
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{
                backgroundColor: '#ecece9ff',
                width: '60vw',
                display: 'flex',
                justifyContent: 'space-between'
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ 
                    p: 1, 
                    fontWeight: 'Bold'
                }}>{idNamePair.name}</Typography>
                <Typography sx={{ p: 1 }}>by {username}</Typography>
            </Box>
            
            <Box sx={{ 
                display: 'flex',
                minWidth: '40%', // Minimum 40%, won't shrink below this
                maxWidth: '40%'  // Maximum 40%, won't grow beyond this
            }}>
                <ListItemButton sx={{ flex: 1 }}>Delete</ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>Edit</ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>Copy</ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>Play</ListItemButton>
            </Box>
        </ListItem>
    );
}