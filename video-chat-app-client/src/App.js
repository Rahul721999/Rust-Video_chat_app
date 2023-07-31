import {Routes, Route} from 'react-router-dom'
import './App.css';
import LobbyScreens from './screens/Lobby';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LobbyScreens/>}/>
      </Routes>
    </div>
  );
}

export default App;
