
import ListItem from "@mui/material/ListItem"

export default function PlaylistCard(props){

    const { idNamePair } = props;
    return (
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
        >
        {idNamePair.name}
        </ListItem>
    )
}