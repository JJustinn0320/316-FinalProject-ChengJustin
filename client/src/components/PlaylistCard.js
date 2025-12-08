
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from "@mui/material/AccordionDetails";
import List from "@mui/material/List";

const buttonStyle = {
    color: "white", 
    borderRadius: '8px',
    mr:2,
    fontSize: 15,  
    minWidth: 60,
    maxHeight: 60,
    justifyContent: 'center',
    flex:1
}

export default function PlaylistCard(props){

    const { playlist, onDelete, onClick, selected } = props;

    const openEditModal = () => {
        console.log('open edit modal')
    }
    const handleCopy = () => {
        console.log('handle copy')
    }
    const openPlayModal = () => {
        console.log('open play modal')
    }

    let songList = [1,2,3,4,5,6]
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
                        <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#e91111ff'  }}
                            onClick={onDelete}
                            >Delete</ListItemButton>
                        <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#3421d8ff'  }}
                            onClick={openEditModal}
                            >Edit</ListItemButton>
                        <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#0b854eff'  }}
                            onClick={handleCopy}
                            >Copy</ListItemButton>
                        <ListItemButton 
                            sx={{...buttonStyle, backgroundColor:'#a82df0ff'  }}
                            onClick={openPlayModal}
                            >Play</ListItemButton>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {songList}
                </AccordionDetails>
            </Accordion>
                
        </ListItem>
    );
}