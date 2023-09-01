import './App.css';
import {Route, Routes} from 'react-router-dom';
import {LobbyScreen, RoomScreen} from './screens';
const App = () => {
    return (
        <div className="App">
            <Routes>
                <Route path='/'
                    element={<LobbyScreen/>}/>
                <Route path='/room/:roomId'
                    element={<RoomScreen/>}/>
            </Routes>
        </div>
    )
}

export default App;
