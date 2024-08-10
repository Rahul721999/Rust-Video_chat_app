import React, { createContext, useMemo, useContext, useCallback, useEffect, useState } from "react";

const PeerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);

  // Initialize RTCPeerConnection with STUN servers
  const peer = useMemo(() => new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" }
    ]
  }), []);

  // Create and set offer for the peer connection
  const createOffer = async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      console.log("Created offer:", offer);
      return offer;
    } catch (error) {
      console.error("Failed to create offer:", error);
      throw error;
    }
  };

  // Create and set answer for the incoming offer
  const createAns = async (offer) => {
    try {
      console.info("Creating answer for the offered call");
      await peer.setRemoteDescription(new RTCSessionDescription(offer)); // add offer to the REMOTE Description
      const ans = await peer.createAnswer(); // create ans for the offer
      await peer.setLocalDescription(ans); // add the ans to the LOCAL description
      return ans;
    } catch (error) {
      console.error("Failed to create answer:", error);
      throw error;
    }
  };

  
  // Set remote answer description
  const setRemoteAns = useCallback(async (ans) => {
    try {
      console.info("Setting remote answer:", ans);
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
    } catch (error) {
      console.error("Failed to set remote answer:", error);
    }
  }, [peer]);

  // Add tracks from the given stream to the peer connection
  const sendStream = useCallback((stream) => {
    console.log("Adding tracks to peer connection");
    const tracks = stream.getTracks();
    for (const track of tracks) {
      console.log("Adding track:", track.kind);
      peer.addTrack(track, stream);
    }
  }, [peer]);

  // Handle incoming track events
  const handleTrackEvent = useCallback((event) => {
    console.info("Track event received:", event);
    if (event.streams && event.streams[0]) {
      console.info("Setting remote stream from event");
      setRemoteStream(event.streams[0]);
    } else {
      console.log('Failed to set track as remote media stream');
      const inboundStream = new MediaStream();
      inboundStream.addTrack(event.track);
      setRemoteStream(inboundStream);
    }
  }, []);

  // Log ICE connection state changes
  const handleICEConnectionStateChange = useCallback(() => {
    console.info("ICE connection state change:", peer.iceConnectionState);
  }, [peer.iceConnectionState]);

  // Set up event listeners for track and ICE connection state changes
  useEffect(() => {
    peer.addEventListener('track', handleTrackEvent);
    peer.addEventListener('iceconnectionstatechange', handleICEConnectionStateChange);

    return () => {
      peer.removeEventListener('track', handleTrackEvent);
      peer.removeEventListener('iceconnectionstatechange', handleICEConnectionStateChange);
    };
  }, [handleTrackEvent, handleICEConnectionStateChange, peer]);

  return (
    <PeerContext.Provider value={{ peer, createOffer, createAns, setRemoteAns, sendStream, remoteStream, setRemoteStream }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeerContext = () => useContext(PeerContext);
