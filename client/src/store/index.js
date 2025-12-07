import { createContext, useState, useContext } from 'react'

import storeRequestSender from './requests'
import AuthContext from '../auth'

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    LOAD_ID_NAME_PAIRS: 'LOAD_ID_NAME_PAIRS',
    HIDE_MODALS: "HIDE_MODALS"
}

const CurrentModal = {
    NONE: "NONE",
    ERROR: "ERROR"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        idNamePairs: null,
        currentModal: CurrentModal.NONE
    })

    const { auth } = useContext(AuthContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentModal: CurrentModal.NONE
                })
            }
            case GlobalStoreActionType.HIDE_MODALS: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentModal: CurrentModal.NONE
                })
            }
            default:
                return store
        }
    }

    store.loadIdNamePairs = async function() {
        const response = await storeRequestSender.getPlaylistPairs();
        if (response.data.success) {
            let pairsArray = response.data.idNamePairs;
            storeReducer({
                type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                payload: pairsArray
            });
        }
        else {
            console.log("FAILED TO GET THE LIST PAIRS");
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