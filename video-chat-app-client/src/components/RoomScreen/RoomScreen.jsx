import React from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../../context/WScontext';

const RoomScreen = () => {
  const { roomId: paramRoomId } = useParams();
  const { roomId: contextRoomId } = useWebSocket();
  // const { socket } = useWebSocket();

  const roomId = contextRoomId || paramRoomId;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      console.info('Room ID copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy room ID: ', err);
    });
  };

  return (
    <div>
      <h2>Room Screen</h2>
      <p>Room ID: {roomId}</p>
      <button onClick={copyToClipboard}>Copy Room ID</button>
    </div>
  );
};

export default RoomScreen;
