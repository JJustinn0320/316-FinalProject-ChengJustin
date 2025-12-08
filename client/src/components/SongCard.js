import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function SongCard(props){
    const { song } = props;
    
    return (
        <ListItem
            id={song._id}
            key={song._id}
        >
            <Box sx={{ 
                flexGrow: 1,
                backgroundColor: '#ebc55eff',
                p:2,
                borderRadius: 4
            }}>
                <Typography sx={{ 
                    p: 1, 
                    fontWeight: 'Bold'
                }}>{song.title} by {song.artist} ({song.year})</Typography>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Typography>Listens: {song.listens}</Typography>
                    <Typography>Playlists: {song.playlists}</Typography>
                </Box>
            </Box>
        </ListItem>
    )
}