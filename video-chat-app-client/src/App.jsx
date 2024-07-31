import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LobbyScreen } from './components';
import { RoomScreen } from './components';
import { WSprovider } from './context/WScontext';
import { PeerProvider } from './context/PeerProvidor';

const App = () => {
  return (
    <WSprovider>
      <PeerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LobbyScreen />} />
            <Route path="/room/:roomId" element={<RoomScreen />} />
          </Routes>
        </Router>
      </PeerProvider>
    </WSprovider>
  );
};

export default App;
