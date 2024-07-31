import React, { createContext, useMemo, useContext } from "react";

const PeerContext = createContext(null);

export const PeerProvider = ({children}) => {
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
    
    const createAns = async (offer) =>{
        try{
            await peer.setRemoteDescription(offer);
            const ans = await peer.createAnswer();
            await peer.setLocalDescription(ans);
            return ans;
        }catch (error){
            console.error("Failed to create Ans: ", error);
            throw error;
        }
    }

    const setRemoteAns = async (ans) =>{
        await peer.setRemoteDescription(ans)
    }
    

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAns, setRemoteAns }} >
            {children}
        </PeerContext.Provider>
    )
}

export const usePeerContext = () => useContext(PeerContext);