
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';

export default function PlaylistCard(props){

    const { playlist } = props;

    return (
        <ListItem
            id={playlist._id}
            key={playlist._id}
            sx={{
                border: '2px solid black',
                backgroundColor: '#ecece9ff',
                width: '60vw',
                display: 'flex',
                justifyContent: 'space-between',
                py: 1,
                mb: 2, // ← Add bottom margin for spacing
                '&:last-child': {
                    mb: 0 // Remove margin from last item
                }
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ 
                    p: 1, 
                    fontWeight: 'Bold'
                }}>{playlist.name}</Typography>
                <Typography sx={{ p: 1 }}>by {playlist.ownerUsername}</Typography>
            </Box>
            
            <Box sx={{ 
                display: 'flex',
                minWidth: '40%',
                maxWidth: '40%', 
            }}>
                <ListItemButton sx={{ flex: 1 }}>Delete</ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>Edit</ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>Copy</ListItemButton>
                <ListItemButton sx={{ flex: 1 }}>Play</ListItemButton>
            </Box>
        </ListItem>
    );
}