import React, { createContext, useContext, useState, useEffect} from "react";
import { usePeerContext } from "./PeerProvidor.jsx";

const WScontext = createContext(null);

export const WSprovider = ({ children }) => {
    const [user_email, setEmail] = useState(null);
    const [socket, setWebSocket] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [onRoomIdSet, setOnRoomIdSet] = useState(null);
    const { createOffer, createAns, setRemoteAns, peer } = usePeerContext();

    const connect = (email, roomId = null) => {
        console.log(`connecting with email: ${email}`);
        setEmail(email);
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
            console.log('Message from server:', message);
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
                        await handle_call_answered(newSocket, email, message.sender, message.ans);
                        break;
                    case 'UserLeft':
                        console.info(`${message.user_email} left the room`);
                        break;
                    case 'ice-candidate':
                        console.info('ice-candidate recieved', message.candidate);
                        await handleIceCandidateEvent(message.candidate)
                        break;
                    default:
                        console.warn('Unknown message type:', message);
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        };

        const handle_user_joined_event = async (socket) => {
            try {
                const offer = await createOffer(); // Create an offer when a user joins
                const offerMessage = {
                    Broadcast: {
                        sender: email,
                        text: JSON.stringify({ type: 'Offer-call', sender: email, offer }),
                    },
                };
                socket.send(JSON.stringify(offerMessage)); // Send the offer as a broadcast message
            } catch (error) {
                console.error('Failed to create offer:', error);
            }
        };

        const handle_offer = async (socket, sender, reciever, offer) => {
            try {
                console.info("Answering call...");
                const ans = await createAns(offer);
                console.info("ANS: " + ans);
                const ansMessage = {
                    Forward: {
                        sender,
                        reciever,
                        text: JSON.stringify({ type: 'Call-Ans', sender, ans }),
                    },
                };
                socket.send(JSON.stringify(ansMessage));
                console.log("Call answered");
            } catch (error) {
                console.error('Failed to handle Offer:', error);
            }
        };

        const handle_call_answered = async (socket, sender, reciever, candidate) => {
            try {
                console.info("Handling call-answered event");
                const remoteAnsMsg = {
                    Forward: {
                        sender,
                        reciever,
                        text: JSON.stringify({type: 'ice-candidate', sender, candidate}),
                    },
                };
                console.log(remoteAnsMsg);
                socket.send(JSON.stringify(remoteAnsMsg));
                setRemoteAns(candidate);
            } catch (error) {
                console.error("Failed to handle call-answered event:", error);
            }
        };

        const handleIceCandidateEvent = async (candidate) => {
            try {
                console.info("handling Ice-Candidate Event")
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("failed to handle Ice-Candidate event: ", error);
            }
        }
    };

    useEffect(() => {
        const handleICECandidate = (event) => {
            if (event.candidate) {
                const candidateMessage = {
                    Broadcast: {
                        sender: user_email,
                        text: JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }),
                    },
                };
                socket.send(JSON.stringify(candidateMessage));
            }
        };
    
        peer.addEventListener('icecandidate', handleICECandidate);
        return () => {
            peer.removeEventListener('icecandidate', handleICECandidate);
        };
    }, [peer, socket, user_email]);

    
    const disconnect = () => {
        if (socket) {
            socket.close();
        }
    };

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
