import React, { createContext, useContext } from "react";

const SocketContext = createContext(null);


export const useSocket = () =>{
    const socket = useContext(SocketContext);
    return socket;
};

export const SocketProvider = (props) =>{
    const socket = new WebSocket("ws://localhost:8080/ws");
    socket.onopen = () =>{
        console.log("connected");
    }
    socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
    };
  
    return (
        <SocketContext.Provider value ={socket}>
            {props.children}
        </SocketContext.Provider>
    );
}