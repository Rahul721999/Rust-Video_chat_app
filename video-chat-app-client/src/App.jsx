import './App.css';
import {Route, Routes} from 'react-router-dom';
import {LobbyScreen} from './screens';
const App = () => {
    return (
        <div className="App">
            <Routes>
                <Route path='/' element={<LobbyScreen/>} />
            </Routes>
        </div>
    )
}

export default App;