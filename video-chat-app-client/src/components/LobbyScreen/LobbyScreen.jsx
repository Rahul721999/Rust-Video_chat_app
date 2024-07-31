// components/LobbyScreen/lobbyscreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../context/WScontext';
import './LobbyScreen.css';

export default function LobbyScreen() {
  const [email, setEmail] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const navigate = useNavigate();
  const { connect, registerOnRoomIdSet } = useWebSocket();

  const handleRoomIdSet = useCallback((newRoomId) => {
    navigate(`/room/${newRoomId}`);
  }, [navigate]);

  useEffect(() => {
    registerOnRoomIdSet(handleRoomIdSet);

    // Clean up function if component unmounts
    return () => {
      registerOnRoomIdSet(null);
    };
  }, [registerOnRoomIdSet, handleRoomIdSet]);

  const handleCreateRoom = () => {
    connect(email);
    // The navigation will happen in the callback when roomId is set
  };

  const handleJoinRoom = () => {
    if (roomIdInput.trim() !== '') {
      connect(email, roomIdInput);
      // The navigation will happen in the callback when roomId is set
    } else {
      alert('Please enter a valid room ID');
    }
  };

  return (
    <div className="lobby-screen">
      <h2>Welcome to my Video Calling App</h2>
      <div className="input-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Room ID:</label>
        <input
          type="text"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />
      </div>
      <div className="button-group">
        <button onClick={handleCreateRoom}>Create New Room</button>
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};
