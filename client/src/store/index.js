import { createContext, useState, useContext } from 'react'

import PlaylistRequestSender from './requests/playlist-requests'
import UserRequestSender from './requests/user-requests'
import SongRequestSender from './requests/song-requests'
import AuthContext from '../auth'

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    LOAD_PLAYLISTS: 'LOAD_PLAYLISTS',
    CREATE_NEW_LIST: 'CREATE_NEW_LIST',
    HIDE_MODALS: "HIDE_MODALS"
}

const CurrentModal = {
    NONE: "NONE",
    ERROR: "ERROR"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        playlistArray: [],
        songArray: [],
        newListCounter: 0,
        currentModal: CurrentModal.NONE
    })

    const { auth } = useContext(AuthContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case GlobalStoreActionType.LOAD_PLAYLISTS: {
                return setStore({
                    playlistArray: payload,
                    songArray: store.songArray,
                    newListCounter: store.newListCounter,
                    currentModal: CurrentModal.NONE
                })
            }
            case GlobalStoreActionType.LOAD_SONGS: {
                return setStore({
                    playlistArray: store.playlistArray,
                    songArray: payload,
                    newListCounter: store.newListCounter,
                    currentModal: CurrentModal.NONE
                })
            }
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    playlistArray: store.playlistArray,
                    songArray: store.songArray,
                    newListCounter: store.newListCounter + 1,
                    currentModal: CurrentModal.NONE
                })
            }
            case GlobalStoreActionType.HIDE_MODALS: {
                return setStore({
                    playlistArray: store.playlistArray,
                    songArray: store.songArray,
                    newListCounter: store.newListCounter, 
                    currentModal: CurrentModal.NONE
                })
            }
            default:
                return store
        }
    }

    store.loadPlaylistArray= async function() {

        const response = await PlaylistRequestSender.getPlaylistArray();
        if (response.data.success) {
            let playlistArray = response.data.playlistArray;
            storeReducer({
                type: GlobalStoreActionType.LOAD_PLAYLISTS,
                payload: playlistArray
            });
        }
        else {
            console.log("FAILED TO GET THE LIST PAIRS");
        }
    }
    store.createNewPlaylist = async function() {
        console.log("createNewPlaylist")
        const username = auth.user.username;
        const userEmail = auth.user.email;
        const userPlaylists = store.playlistArray.filter(pair => 
            pair.ownerEmail === userEmail
        );
        console.log(userPlaylists)

        const usedNames = new Set();
        userPlaylists.forEach(pair => {
            if (pair.name.startsWith('Untitled ')) {
                usedNames.add(pair.name);
            }
        });
        console.log(usedNames)

        let counter = 0;
        let newListName = `Untitled ${counter}`;
        
        // Keep incrementing until we find an unused name
        while (usedNames.has(newListName)) {
            counter++;
            newListName = `Untitled ${counter}`;
        }
        console.log(`Creating playlist with name: ${newListName}`);

        try{            

            const response = await PlaylistRequestSender.createPlaylist(newListName, username, userEmail, [], [], false);
            if(response.status === 201){
                let newList = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_LIST,
                    payload: {newList, counter}
                });
            }
        }
        catch (error){
            console.log("Failed to Create a New Playlist: ", error)
        }
    }
    // ==============
    // SONG FUNCTIONS
    // ==============
    store.loadSongArray = async function() {

    }


    // ==============
    // USER FUNCTIONS
    // ==============
    store.getUserByEmail = async (email) => {
        try {
            // console.log("Fetching user for email:", email);
            const response = await UserRequestSender.getUserByEmail(email);
            // console.log("User response:", response.data);
            return response.data.user; // Assuming response has data.user
        } catch (error) {
            console.error(`store.getUserByEmail error: ${error}`);
            return null; // Return null on error
        }
    }

    store.hideModals = () => {
        auth.errorMessage = null;
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };