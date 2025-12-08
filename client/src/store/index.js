import { createContext, useState, useContext } from 'react'

import PlaylistRequestSender from './requests/playlist-requests'
import UserRequestSender from './requests/user-requests'
import SongRequestSender from './requests/song-requests'
import AuthContext from '../auth'

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    LOAD_PLAYLISTS: 'LOAD_PLAYLISTS',
    LOAD_SONGS: 'LOAD_SONGS',
    CREATE_NEW_LIST: 'CREATE_NEW_LIST',
    CREATE_NEW_SONG: 'CREATE_NEW_SONG',
    ADD_SONG_TO_PLAYLIST: 'ADD_SONG_TO_PLAYLIST',
    OPEN_MODAL: 'OPEN_MODAL',
    HIDE_MODALS: "HIDE_MODALS"
}

const CurrentModal = {
    NONE: "NONE",
    CREATE_SONG: "CREATE_SONG",
    ERROR: "ERROR"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        playlistArray: [],
        songArray: [],
        newListCounter: 0,
        currentModal: CurrentModal.NONE,
    })

    const { auth } = useContext(AuthContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        setStore(prevStore => {
            switch (type) {
                case GlobalStoreActionType.LOAD_PLAYLISTS: {
                    return {
                        ...prevStore,
                        playlistArray: payload,
                        currentModal: CurrentModal.NONE,
                    }
                }
                case GlobalStoreActionType.LOAD_SONGS: {
                    return {
                        ...prevStore,
                        songArray: payload,
                        currentModal: CurrentModal.NONE,
                    }
                }
                case GlobalStoreActionType.CREATE_NEW_LIST: {
                    // For playlist, you might want to add it to array too
                    const newPlaylistArray = [...prevStore.playlistArray, payload.newList];
                    return {
                        ...prevStore,
                        playlistArray: newPlaylistArray,
                        newListCounter: prevStore.newListCounter + 1,
                        currentModal: CurrentModal.NONE
                    }
                }
                case GlobalStoreActionType.ADD_SONG_TO_PLAYLIST: {
                    const updatedPlaylistArray = prevStore.playlistArray.map(playlist => 
                        playlist._id === payload._id ? payload : playlist
                    );
                    return {
                        ...prevStore,
                        playlistArray: updatedPlaylistArray,
                        currentModal: CurrentModal.NONE
                    }
                }
                case GlobalStoreActionType.CREATE_NEW_SONG: {
                    const newSongArray = [...prevStore.songArray, payload];
                    return {
                        ...prevStore,
                        songArray: newSongArray,
                        currentModal: CurrentModal.NONE
                    }
                }
                case GlobalStoreActionType.OPEN_MODAL: {
                    return {
                        ...prevStore,
                        currentModal: payload
                    }
                }
                case GlobalStoreActionType.HIDE_MODALS: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                    }
                }
                default:
                    return prevStore;
            }
        });
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
        const userPlaylists = store.playlistArray.filter(playlist => 
            playlist.ownerEmail === userEmail
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
                this.loadPlaylistArray()
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
        const response = await SongRequestSender.getSongArray();
        if (response.data.success) {
            let songArray = response.data.songArray;
            storeReducer({
                type: GlobalStoreActionType.LOAD_SONGS,
                payload: songArray
            });
        }
        else {
            console.log("FAILED TO GET THE LIST PAIRS");
        }
    }
    store.createSong = async function(title, artist, year, youTubeId) {
        try {
            const response = await SongRequestSender.createSong(title, artist, year, youTubeId, 0, 0, auth.user.username, auth.user.email);
            
            console.log("Create song response:", response);
            
            if (response.status === 201) {
                let newSong = response.data.song;
                
                // Update store 
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_SONG,
                    payload: newSong
                });
                
                return { 
                    success: true, 
                    song: newSong 
                };
            } else {
                // Handle non-201 responses (like 400 for validation errors)
                console.log("Backend returned error:", response.data);
                return { 
                    success: false, 
                    message: response.data.message || "Failed to create song"
                };
            }
        } catch (error) {
            console.log("Failed to Create a New Song:", error);
            return { 
                success: false, 
                message: error.response.data.message || error.message
            }
             
        }
    };

    // =======================
    // SONG-PLAYLIST FUNCTIONS
    // =======================
    store.addSongToPlaylist = async (PlaylistId, SongId) => {
        console.log('store.addSongToPlaylist')
        try{
            const response = await PlaylistRequestSender.addSongToPlaylist(PlaylistId, SongId)
            if (response.status === 200) {
                let updatedPlaylist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.ADD_SONG_TO_PLAYLIST,
                    payload: updatedPlaylist
                })

                return { 
                    success: true, 
                };
            }
            else{
                console.log("Backend returned error:", response.data);
                return { 
                    success: false, 
                    message: response.data.message || "Failed to add song to playlist"
                };
            }
        }
        catch (error){
            console.log("Failed to Create a New Song:", error);
            return { 
                success: false, 
                message: error.response.data.message || error.message
            }
        }
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


    store.openCreateSongModal = function() {
        storeReducer({
            type: GlobalStoreActionType.OPEN_MODAL,
            payload: CurrentModal.CREATE_SONG
        })
    };
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