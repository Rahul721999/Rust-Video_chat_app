import React, { createContext, useContext, useState, useEffect} from "react";
import { usePeerContext } from "./PeerProvidor.jsx";

const WScontext = createContext(null);

export const WSprovider = ({ children }) => {
    const [sender, setSender] = useState(null);
    const [socket, setWebSocket] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [onRoomIdSet, setOnRoomIdSet] = useState(null);
    const { createOffer, createAns, peer } = usePeerContext();

    const connect = (email, roomId = null) => {
        console.log(`connecting with email: ${email}`);
        setSender(email);
        const url = roomId
            ? `ws://localhost:8080/ws/?email=${encodeURIComponent(email)}&room=${roomId}`
            : `ws://localhost:8080/ws/?email=${encodeURIComponent(email)}`;
        console.debug(`${url}`);

        const newSocket = new WebSocket(url);
        setWebSocket(newSocket);

        newSocket.onopen = () => {
            console.debug('WebSocket connection established');
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('🔖 Message from server:', message);
            handleWebSocketMessage(message);
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
            setWebSocket(null);
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        const handleWebSocketMessage = async (message) => {
            try {
                switch (message.type) {
                    case 'RoomId':
                        setRoomId(message.roomId);
                        if (onRoomIdSet) onRoomIdSet(message.roomId);
                        break;
                    case 'UserJoined':
                        console.info(`${message.user_email} Joined`);
                        await handle_user_joined_event(newSocket);
                        break;
                    case 'Notification':
                        console.log(message.msg);
                        break;
                    case 'Offer-call':
                        console.info(`Incoming call from : ${message.sender}`);
                        await handle_offer(newSocket, email, message.sender, message.offer);
                        break;
                    case 'Call-Ans':
                        console.log(`call answered by: `, message.sender);
                        await handle_call_answered(message.ans);
                        break;
                    case 'UserLeft':
                        console.info(`${message.user_email} left the room`);
                        break;
                    case 'Ice-candidate':
                        console.info('ice-candidate recieved');
                        await handleIceCandidateEvent(message.candidate)
                        break;
                    default:
                        console.warn('Unknown message type:', message);
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        };

        /* ---------------------------------------User2-joined event--------------------------------------- */
        // use1 offering a call
        const handle_user_joined_event = async (socket) => {
            try {
                console.debug("creating offer for newly-joined user.")
                const offer = await createOffer(); // Create an offer when a user joins
                const offerMessage = {
                    Broadcast: {
                        sender: email,
                        text: JSON.stringify({ type: 'Offer-call', sender: email, offer }),
                    },
                };
                socket.send(JSON.stringify(offerMessage)); // Send the offer as a broadcast message
                console.debug(`🚀Offer: ${offerMessage.Broadcast.text}`);
            } catch (error) {
                console.error('Failed to create offer:', error);
            }
        };

        /* ---------------------------------user1 offered a call to user2---------------------------------*/
        // user2 accepting call by creating an Answer for the offer
        const handle_offer = async (socket, sender, reciever, offer) => {
            try {
                console.debug(`Accepting call offer: ${offer.sdp}`);
                if (peer.signalingState !== 'stable') {
                    console.warn('Peer connection is not in stable state. Ignoring offer.');
                    return;
                }
        
                console.debug("Answering call...");
                const ans = await createAns(offer); // create ans for the offer
        
                /* Forward the 'ans' to the person who offered the call stating,
                    you accepted the call, here's the ans. */
                const ansMessage = {
                    Forward: {
                        sender,
                        reciever,
                        text: JSON.stringify({ type: 'Call-Ans', sender, ans }),
                    },
                };
                socket.send(JSON.stringify(ansMessage));
                console.log(`🚩Call answered. Ans: ${ansMessage.Forward.text}`);
            } catch (error) {
                console.error('Failed to handle Offer:', error);
            }
        };

        /* ------------------------------user2 accepted the call from user1------------------------------ */
        // Now user1 have to set the 'ans' to remote-description
        const handle_call_answered = async (call_ans) => {
            try {
                if (peer.signalingState !== 'have-local-offer') {
                    console.warn('Peer connection is not in the correct state to handle answer.');
                    return;
                }
        
                console.info("Handling call-answered event");
                await peer.setRemoteDescription(new RTCSessionDescription(call_ans));
            } catch (error) {
                console.error("Failed to handle call-answered event:", error);
            }
        };
        
        /* ----------------------------------Handling ICE-Candidate event---------------------------------- */
        // Everytime when new IceCandidate is found add it to the Peer.
        const handleIceCandidateEvent = async (candidate) => {
            try {
                console.info("handling Ice-Candidate Event")
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("failed to handle Ice-Candidate event: ", error);
            }
        }
    };

    // Invokes the HandleIceCandidate event for new ICE-Candidate found event
    useEffect(() => {
        const handleICECandidate = (event) => {
            if (event.candidate) {
                const candidateMessage = {
                    Broadcast: {
                        sender,
                        text: JSON.stringify({ type: 'Ice-candidate', candidate: event.candidate }),
                    },
                };
                socket.send(JSON.stringify(candidateMessage));
            }
        };
    
        peer.addEventListener('icecandidate', handleICECandidate);
        return () => {
            peer.removeEventListener('icecandidate', handleICECandidate);
        };
    }, [peer, socket, sender]);

    
    /* Socket Disconnect event */
    const disconnect = () => {
        if (socket) {
            socket.close();
        }
    };

    /*  */
    const registerOnRoomIdSet = (callback) => {
        setOnRoomIdSet(() => callback);
    };



    return (
        <WScontext.Provider value={{ socket, connect, disconnect, roomId, registerOnRoomIdSet }}>
            {children}
        </WScontext.Provider>
    );
};

export const useWebSocket = () => useContext(WScontext);
