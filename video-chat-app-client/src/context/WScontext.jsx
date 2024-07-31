import React, { createContext, useContext, useState } from "react";

const WScontext = createContext(null);

export const WSprovider = ({ children }) => {
    const [socket, setWebSocket] = useState(null);
    const [roomId, setRoomId] = useState(null);


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
            console.log(`Disconnected from room ${roomId}`);
            setWebSocket(null);
        };

        newSocket.onerror = (error) => {
            console.error(`WebSocket error: ${error}`);
        };


        // diff ws-msg handler
        const handleWebSocketMessage = (message) => {
            switch (message.type) {
                case 'RoomId':
                    setRoomId(message.roomId);
                    break;
                case 'UserJoined':
                    break;
                case 'Notification':
                    console.log(message.msg);
                    break;
                default:
                    console.warn('Unknown message type:', message);
            }
        };
    }

    const disconnect = () => {
        if (socket) {
            socket.close()
        }
    }


    return (
        <WScontext.Provider value={{ socket, connect, disconnect, roomId }}>
            {children}
        </WScontext.Provider>
    )
}

export const useWebSocket = () => useContext(WScontext);