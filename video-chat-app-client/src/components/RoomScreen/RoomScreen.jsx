import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../../context/WScontext';
import { usePeerContext } from '../../context/PeerProvidor';
import './RoomScreen.css';

const RoomScreen = () => {
  const { roomId: paramRoomId } = useParams();
  const { roomId: contextRoomId } = useWebSocket();
  const [myStream, setMyStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true); // New state for video toggle
  const { sendStream, remoteStream } = usePeerContext();
  const remoteVideoRef = useRef(null); // Ref for remote video element

  const roomId = contextRoomId || paramRoomId;

  const getUserMediaStream = useCallback(async () => {
    console.log("Requesting local media stream");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const localTrackIds = stream.getTracks().map(track => track.id);
      console.log("🚀Local Track IDs:", localTrackIds);
      sendStream(stream); // Send user's stream to another user
      setMyStream(stream); // Render user's stream
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

  useEffect(() => {
    if (myStream) {
      // Update the video track's enabled state based on videoEnabled
      myStream.getVideoTracks().forEach(track => track.enabled = videoEnabled);
    }
  }, [videoEnabled, myStream]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      console.info('Room ID copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy room ID: ', err);
    });
  };

  // Set the remote stream to the video element
  useEffect(() => {
    console.info("✅Remote Stream updated", remoteStream);
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Toggle video function
  const toggleVideo = () => {
    setVideoEnabled(prevState => !prevState);
  };

  return (
    <div>
      <h2>Room Screen</h2>
      <div className="video-container">
        {myStream && (
          <div className="video-wrapper">
            <div className="username-label">My Video</div>
            <video ref={el => { if (el) el.srcObject = myStream; }} autoPlay muted />
            <button onClick={toggleVideo}>
              {videoEnabled ? 'Turn Video Off' : 'Turn Video On'}
            </button>
          </div>
        )}
      </div>
      <div className="video-container">
        <div className="video-wrapper">
          <div className="username-label">Remote Video</div>
          <video ref={remoteVideoRef} autoPlay />
        </div>
      </div>
      <p>Room ID: {roomId}</p>
      <button onClick={copyToClipboard}>Copy Room ID</button>
    </div>
  );
};

export default RoomScreen;
