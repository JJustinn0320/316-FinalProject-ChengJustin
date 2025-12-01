import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import {
    AppBanner,
    HomeWrapper,
    LoginScreen,
    RegisterScreen,
    EditAccountScreen,
    PlaylistScreen,
    SongCatalogScreen
} from './components'
const App = () => {  
  return (
        <BrowserRouter>            
          <AppBanner />
          <Routes>
              <Route path="/" element={<HomeWrapper />} />
              <Route path="/login/" element={<LoginScreen />} />
              <Route path="/register/" element={<RegisterScreen />} />
              <Route path="/edit/" element={<EditAccountScreen />} />
              <Route path="/playlists/" element={<PlaylistScreen />} />
              <Route path="/songs/" element={<SongCatalogScreen />} />
          </Routes>
        </BrowserRouter>
    )
}

export default App;
