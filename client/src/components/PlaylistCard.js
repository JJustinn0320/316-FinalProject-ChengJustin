import { useContext} from 'react'

import AuthContext from '../auth';

import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from "@mui/material/AccordionDetails";
import List from '@mui/material/List';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
//import List from "@mui/material/List";

const buttonStyle = {
    color: "white", 
    borderRadius: '8px',
    mr:2,
    fontSize: 15,  
    minWidth: 60,
    maxWidth: 60,
    maxHeight: 60,
    justifyContent: 'center',
    flex:1
}

export default function PlaylistCard(props){

    const { playlist, onDelete, onEdit, onPlay, onCopy, onClick, selected } = props;

    const {auth} = useContext(AuthContext)

    const accountCircle = <AccountCircleIcon sx={{ color: "#f26fcf", fontSize: 40, background: "white", borderRadius: '50%'}}/>

    const avatar = <Box
        component="img"
        src={auth?.user?.avatar}
        alt="User avatar"
        sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #f26fcf',
            backgroundColor: 'white',
            mb: 1
        }}/>


    const songList = playlist.songs
        ?.map((song, index) => (
            <ListItem key={`${song._id}-${index}`}>
                <Typography>
                    {index + 1}. {song.title} by {song.artist} ({song.year})
                </Typography>
            </ListItem>
        )) || null
    return (
        <ListItem
            id={playlist._id}
            key={playlist._id}
            sx={{
                mr:16,
                display: 'flex',
                justifyContent: 'space-between',
                py: 1,
                mb: 2, // ← Add bottom margin for spacing
                '&:last-child': {
                    mb: 0 // Remove margin from last item
                },
            }}>
            <Accordion 
                onClick={onClick}
                sx={{ 
                    width: '100%', 
                    backgroundColor: '#ecece9ff',
                    border: selected ? '3px solid #d38919ff' : '1px solid #ccc',
                    flexGrow: 1,
                    p:2,
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'border 0.8',
                    '&:hover': { borderColor: '#d38919ff'}
                    }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"

                    >
                    {(auth.loggedIn && playlist.ownerEmail === auth?.user.email) ? avatar : accountCircle}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ 
                            p: 1, 
                            fontWeight: 'Bold'
                        }}>{playlist.name}</Typography>
                        <Typography sx={{ p: 1 }}>by {playlist.ownerUsername}</Typography>
                        <Typography>listens: {playlist.listens.length}</Typography>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex',
                        minWidth: '30%',
                        maxWidth: '30%', 
                    }}>
                        {playlist.ownerEmail === auth?.user?.email && <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#e91111ff'  }}
                            onClick={onDelete}
                            >Delete</ListItemButton>}
                        {playlist.ownerEmail === auth?.user?.email && <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#3421d8ff'  }}
                            onClick={onEdit}
                            >Edit</ListItemButton>}
                        {auth.loggedIn&&<ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#0b854eff'  }}
                            onClick={onCopy}
                            >Copy</ListItemButton>}
                        <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#a82df0ff'  }}
                            onClick={onPlay}
                            >Play</ListItemButton>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {songList}
                    </List>
                </AccordionDetails>
            </Accordion>
                
        </ListItem>
    );
}