// WScontext.jsx
import React, { createContext, useContext, useState } from "react";
import { usePeerContext } from "./PeerProvidor.jsx";

const WScontext = createContext(null);

export const WSprovider = ({ children }) => {
    const [socket, setWebSocket] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [onRoomIdSet, setOnRoomIdSet] = useState(null);
    const { createOffer, createAns, setRemoteAns } = usePeerContext();

    const connect = (email, roomId = null) => {
        console.log(`connecting with email: ${email}`);
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
            console.log(`Disconnected from room`);
            setWebSocket(null);
        };

        newSocket.onerror = (error) => {
            console.error(`WebSocket error: ${error}`);
        };

        const handleWebSocketMessage = async (message) => {
            switch (message.type) {
                case 'RoomId':
                    setRoomId(message.roomId);
                    if (onRoomIdSet) onRoomIdSet(message.roomId);
                    break;
                case 'UserJoined':
                    console.info(`${message.user_email} Joined`);
                    handle_user_joined_event(newSocket);
                    break;
                case 'Notification':
                    console.log(message.msg);
                    break;
                case 'Offer-call' :
                    console.info(`Incoming call from : ${message.sender}`);
                    handle_offer(newSocket, email, message.sender, message.offer);
                    break;
                case 'Call-Ans':
                    console.log(`call answered by : `, message.sender);
                    handle_call_answered(message.ans);
                    break;
                case "UserLeft" :
                    console.info(`${message.user_email} left the room`)
                default:
                    console.warn('Unknown message type:', message);
            }
        };

        const handle_user_joined_event = async (newSocket) => {
            
            try {
                const offer = await createOffer(); // Create an offer when a user joins
                const offerMessage = {
                    Broadcast: {
                        sender: email,
                        text: JSON.stringify({ type: 'Offer-call', sender: email, offer}),
                    },
                };
                newSocket.send(JSON.stringify(offerMessage)); // Send the offer as a broadcast message
            } catch (error) {
                console.error('Failed to create offer:', error);
            }
        }

        const handle_offer = async (newSocket, sender, reciever, offer) =>{
            console.info("Answering call..")
            try{
                const ans = await createAns(offer);
                const ansMessage = {
                    Forward:{
                        sender, reciever, text: JSON.stringify({type: 'Call-Ans',sender , ans})
                    },
                }
                newSocket.send(JSON.stringify(ansMessage));
                console.log("call answered")
            } catch (error) {
                console.error('Failed to create ans:', error);
            }
        }

        const handle_call_answered = async (ans)=> {
            try{
                await setRemoteAns(ans)
            }catch(error){
                console.log("failed to handle call-answered event: ",error);
            }
        }
    };

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
