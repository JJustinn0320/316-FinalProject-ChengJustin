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
    COPY_PLAYLIST: 'COPY_PLAYLIST',
    EDIT_PLAYLIST: 'EDIT_PLAYLIST',
    DELETE_PLAYLIST: 'DELETE_PLAYLIST',
    CREATE_NEW_SONG: 'CREATE_NEW_SONG',
    EDIT_SONG: 'EDIT_SONG',
    DELETE_SONG: 'DELETE_SONG',
    ADD_SONG_TO_PLAYLIST: 'ADD_SONG_TO_PLAYLIST',
    OPEN_MODAL: 'OPEN_MODAL',
    HIDE_MODALS: "HIDE_MODALS"
}

export const CurrentModal = {
    NONE: "NONE",
    DELETE_PLAYLIST: "DELETE_PLAYLIST",
    EDIT_PLAYLIST: "EDIT_PLAYLIST",
    CREATE_SONG: "CREATE_SONG",
    EDIT_SONG: "EDITING_SONG",
    DELETE_SONG: "DELETE_SONG",
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
                        // currentModal: CurrentModal.NONE,
                    }
                }
                case GlobalStoreActionType.LOAD_SONGS: {
                    return {
                        ...prevStore,
                        songArray: payload,
                        // currentModal: CurrentModal.NONE,
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
                case GlobalStoreActionType.COPY_PLAYLIST: {
                    const newPlaylistArray = [...prevStore.playlistArray, payload];
                    return {
                        ...prevStore,
                        playlistArray: newPlaylistArray,
                        currentModal: CurrentModal.NONE
                    }
                }
                case GlobalStoreActionType.EDIT_PLAYLIST: {
                    const newPlaylistArray = prevStore.playlistArray.map(playlist => 
                        playlist._id === payload._id ? payload : playlist
                    );
                    return {
                        ...prevStore,
                        playlistArray: newPlaylistArray,
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
                case GlobalStoreActionType.DELETE_PLAYLIST: {
                    const newPlaylistArray = prevStore.playlistArray.filter(playlistArray => playlistArray._id.toString() !== payload._id.toString());
                    return {
                        ...prevStore,
                        playlistArray: newPlaylistArray,
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
                case GlobalStoreActionType.EDIT_SONG: {
                    const newSongArray = [...prevStore.songArray, payload];
                    return {
                        ...prevStore,
                        songArray: newSongArray,
                        currentModal: CurrentModal.NONE
                    }
                }
                case GlobalStoreActionType.DELETE_SONG: {
                    const newSongArray = prevStore.songArray.filter(song => song._id.toString() !== payload._id.toString());

                    return {
                        ...prevStore,
                        songArray: newSongArray,
                        currentModal: CurrentModal.NONE
                    }
                }
                case GlobalStoreActionType.OPEN_MODAL: {
                    console.log("reducer setting currentModal to " + payload)
                    
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
    store.deletePlaylist = async function(id) {

        try{
            const response = await PlaylistRequestSender.deletePlaylist(id);
            console.log(response)
            if(response.status === 200){
                console.log('staus 200')
                let oldPlaylist = response.data.playlist;
                console.log(oldPlaylist)
                // Update store 
                storeReducer({
                    type: GlobalStoreActionType.DELETE_PLAYLIST,
                    payload: oldPlaylist
                });
                this.loadPlaylistArray()
                return { 
                    success: true, 
                    song: oldPlaylist
                };
            }
            else{
                console.log("Backend returned error:", response);
                return { 
                    success: false, 
                    message: response.data.message || "Failed to create song"
                };
            }
        }
        catch (error){
            console.log("Failed to Delete Playlist:", error);
            return { 
                success: false, 
                message: error.response.data.message || error.message
            }
        }
    }
    store.copyPlaylist = async function(id){
        console.log('store.copyPlay')
        try{
            const response = await PlaylistRequestSender.copyPlaylist(id);
            if(response.status === 200){
                const copyPlaylist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.COPY_PLAYLIST,
                    payload: copyPlaylist
                })
                return {
                    success: true,
                    playlist: copyPlaylist
                }
            }
        }
        catch (error){
            console.log("Failed to Copy Playlist:", error);
            return { 
                success: false, 
                message: error.response.data.message || error.message
            }
        }
    }
    store.editPlaylist = async function(id, newName, songs){
       console.log('store.editPlaylist');
        try{
            // Ensure songs is always an array
            const songArray = Array.isArray(songs) ? songs : [];
            // Extract song IDs
            const songIds = songArray.map(song => song._id || song);
            
            const response = await PlaylistRequestSender.editPlaylist(
                id, 
                newName, 
                songIds // Always send array, even if empty
            );

            if(response.data.success) {
                const updatedPlaylist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.EDIT_PLAYLIST,
                    payload: updatedPlaylist
                });
                return {
                    success: true,
                    playlist: updatedPlaylist
                };
            } else {
                return { 
                    success: false, 
                    message: response.data.message 
                };
            }
        }
        catch (error) {
            console.error("Failed to edit Playlist:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message
            };
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
    store.editSong = async function(songId, title, artist, year, youTubeId) {
        try{
            const response = await SongRequestSender.editSong(songId, title, artist, year, youTubeId)
            
            console.log("Edit song response:", response);
            
            if (response.status === 200) {
                console.log()
                let newSong = response.data.song;
                
                // Update store 
                storeReducer({
                    type: GlobalStoreActionType.EDIT_SONG,
                    payload: newSong
                });
                this.loadSongArray()
                return { 
                    success: true, 
                    song: newSong 
                };
            } else {
                // Handle non-201 responses (like 400 for validation errors)
                console.log("Backend returned error:", response.data);
                return { 
                    success: false, 
                    message: response.data.message || "Failed to edit song"
                };
            }
        
        }
        catch (error){
            console.log("Failed to edit a Song:", error);
            return { 
                success: false, 
                message: error.response.data.message || error.message
            }
        }

    }
    store.deleteSong = async function(songId){
        try{
            const response = await SongRequestSender.deleteSong(songId)

            if (response.status === 200) {

                let oldSong = response.data.song;
                
                // Update store 
                storeReducer({
                    type: GlobalStoreActionType.DELETE_SONG,
                    payload: oldSong
                });
                this.loadSongArray()
                return { 
                    success: true, 
                    song: oldSong
                };
            } else {
                // Handle non-201 responses (like 400 for validation errors)
                console.log("Backend returned error:", response);
                return { 
                    success: false, 
                    message: response.data.message || "Failed to edit song"
                };
            }
        }
        catch (error){
            console.log("failed to delete song")
            return { 
                success: false, 
                message: error.response.data.message || error.message
            }
        }
    }
    store.copySong = async function (songId){
        try{
            const response = await SongRequestSender.copySong(songId)
            if (response.status === 201){
                let copiedSong = response.data.song

                storeReducer({
                    type: GlobalStoreActionType.COPY_SONG,
                    payload: copiedSong
                })
                return {
                    success: true,
                    song: copiedSong
                }
            }
            else {
                // Handle non-201 responses (like 400 for validation errors)
                console.log("Backend returned error:", response.status);
                return { 
                    success: false, 
                    message: response.data.message || "Failed to copy song"
                };
            }
        }
        catch (error){
            console.log("failed to copy song")
            return { 
                success: false, 
                message: error || error.message
            }
        }
    }

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

    store.openEditSongModal = () => {
        console.log('called')
        storeReducer({
            type: GlobalStoreActionType.OPEN_MODAL,
            payload: CurrentModal.EDIT_SONG
        })
    }
    store.openModal = (modal) => {
        console.log(modal + " was passed to store")
        storeReducer({
            type: GlobalStoreActionType.OPEN_MODAL,
            payload: modal
        })
    };
    store.hideModals = () => {
        auth.errorMessage = null;
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }

    /////////////////
    // TRANSATIONS //
    /////////////////

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