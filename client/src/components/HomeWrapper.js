import { useContext } from 'react'
import PlaylistScreenScreen from './PlaylistScreen'
import LandingScreen from './LandingScreen'
import AuthContext from '../auth'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);
    console.log("HomeWrapper auth.loggedIn: " + auth.loggedIn);

    if (auth.loggedIn)
        return <PlaylistScreenScreen />
    else
        return <LandingScreen />
}