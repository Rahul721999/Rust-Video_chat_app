import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../../context/WScontext';
import { usePeerContext } from '../../context/PeerProvidor';
import './RoomScreen.css';
const RoomScreen = () => {
  const { roomId: paramRoomId } = useParams();
  const { roomId: contextRoomId } = useWebSocket();
  const [myStream, setMyStream] = useState(null);
  const { sendStream, remoteStream } = usePeerContext();

  const roomId = contextRoomId || paramRoomId;

  const getUserMediaStream = useCallback(async () => {
    console.log("Requesting local media stream");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Local stream obtained");
      sendStream(stream);
      setMyStream(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }, [sendStream]);

  useEffect(() => {
    if (!myStream) {
      console.log("Calling getUserMediaStream...");
      getUserMediaStream();
    }
  }, [getUserMediaStream, myStream]);

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
      <div className="video-container">
        {myStream && (
          <div className="video-wrapper">
            <div className="username-label">My Video</div>
            <video ref={el => { if (el) el.srcObject = myStream; }} autoPlay muted />
          </div>
        )}
      </div>
      <div className="video-container">
        {remoteStream && (
          <div className="video-wrapper">
            <div className="username-label">{"remote-video"}</div>
            <video ref={el => { if (el) el.srcObject = remoteStream; }} autoPlay muted />
          </div>
        )}
      </div>
      <p>Room ID: {roomId}</p>
      <button onClick={copyToClipboard}>Copy Room ID</button>
    </div>
  );
};

export default RoomScreen;
