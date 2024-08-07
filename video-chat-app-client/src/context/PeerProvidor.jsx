import React, { createContext, useMemo, useContext, useCallback, useEffect, useState } from "react";

const PeerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peer = useMemo(() => new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" }
    ]
  }), []);

  const createOffer = async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Failed to create offer:", error);
      throw error;
    }
  };

  const createAns = async (offer) => {
    try {
      console.info("creating ans for offered-call");
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const ans = await peer.createAnswer();
      await peer.setLocalDescription(ans);
      return ans;
    } catch (error) {
      console.error("Failed to create answer:", error);
      throw error;
    }
  };

  const setRemoteAns = async (ans) => {
    console.info("setting remote ans in peerProvider: ", ans);
    await peer.setRemoteDescription(new RTCSessionDescription(ans));
  };

  const sendStream = useCallback((stream) => {
    console.log("Adding tracks to peer connection");
    const tracks = stream.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, stream);
      
    }
  }, [peer]);

  const handleTrackEvent = useCallback((event) => {
    console.info("Track event received");
    if (event.streams && event.streams[0]) {
      setRemoteStream(event.streams[0]);
    } else {
      const inboundStream = new MediaStream();
      inboundStream.addTrack(event.track);
      setRemoteStream(inboundStream);
    }
  }, []);

  const handleICECandidate = (event) => {
    if (event.candidate) {
      console.info("New ICE candidate");
      // Send the candidate to the remote peer
      // Example:
      // socket.emit('ice-candidate', event.candidate);
    }
  };

  const handleICEConnectionStateChange = useCallback(() => {
    console.info("ICE connection state change:", peer.iceConnectionState);
  }, [peer.iceConnectionState]);


  useEffect(() => {
    peer.addEventListener('track', handleTrackEvent);
    peer.addEventListener('icecandidate', handleICECandidate);
    peer.addEventListener('iceconnectionstatechange', handleICEConnectionStateChange);
    return () => {
      peer.removeEventListener('track', handleTrackEvent);
      peer.removeEventListener('icecandidate', handleICECandidate);
      peer.removeEventListener('iceconnectionstatechange', handleICEConnectionStateChange);
    };
  }, [handleTrackEvent,handleICEConnectionStateChange, peer]);

  return (
    <PeerContext.Provider value={{ peer, createOffer, createAns, setRemoteAns, sendStream, remoteStream }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeerContext = () => useContext(PeerContext);
