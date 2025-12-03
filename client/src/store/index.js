import { createContext, useState } from 'react'

import storeRequestSender from './requests'

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    LOAD_ID_NAME_PAIRS: 'LOAD_ID_NAME_PAIRS',
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        idNamePairs: null,
    })

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload
                })
            }
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