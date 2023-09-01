// import React, { createContext, useContext } from "react";

// const SocketContext = createContext(null);


// export const useSocket = () =>{
//     const socket = useContext(SocketContext);
//     return socket;
// };

// export const SocketProvider = ({roomId,children}) =>{

//     const socket = new WebSocket(`ws://localhost:8080/${roomId}`);
//     socket.onopen = () =>{
//         console.log("connected");
//     }
//     socket.onclose = (event) => {
//         console.log('WebSocket connection closed:', event.code, event.reason);
//     };
  
//     return (
//         <SocketContext.Provider value ={socket}>
//             {children}
//         </SocketContext.Provider>
//     );
// }


export const ConnectSocket = (roomId) =>{
    console.log("connecting to room_id: "+roomId);
    const socket = new WebSocket(`ws://localhost:8080/${roomId}`);
    socket.onopen = () =>{
        console.log('socket connected');
    }
    
    socket.onclose = (event) =>{
        console.log('WebSocket connection closed:', event.code, event.reason);

    }
    
    return (socket)
}