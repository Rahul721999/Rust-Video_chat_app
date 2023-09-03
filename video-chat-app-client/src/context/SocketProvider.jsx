

export const ConnectSocket = (email, roomId) =>{
    // console.log("connecting to room_id: "+roomId);
    const socket = new WebSocket(`ws://localhost:8080/${roomId}`);
    socket.onopen = () =>{
        console.log('socket connected');
        socket.send(JSON.stringify({req_type: "CreateRoomReq", email : email, room : roomId}));
    }
    socket.onclose = (event) =>{
        console.log('WebSocket connection closed:', event.code, event.reason);
    }
    
    return (socket)
}