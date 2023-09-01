import React, {useCallback, useEffect, useState} from "react"



const RoomScreen = ()=>{
    const [remoteSocketId, setRSI] = useState(null);
    // const [myStream, setMyStream] = useState();

    /* ----------------------------Handle call req----------------------------*/
    const handleCall = () =>{
        
    }

    /* -----------------------Handle Room Joined event-----------------------*/
    // const handleRoomJoined = useCallback(({email, roomId}) =>{
    //     console.log(`Email : ${email} Joined the room_id: ${roomId}.`)
    // }, [])
    // useEffect(()=>{
    //     socket.onmessage = (msg) => {
    //         const rec_msg = JSON.parse(msg.data);
    //         const type = rec_msg.req_type;
    //         switch (type) {
    //             case "JoinedRoom":{
    //                 handleRoomJoined(rec_msg);
    //                 break;
    //             }
    //             default:
    //                 console.log("ReqType not defined");
    //                 break;
    //         }
    //     }
 
    // }, [socket, handleRoomJoined]);

    return(
        <div>
            <h1>Room screen</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
            {remoteSocketId && <button onClick={handleCall}>CALL</button>

            }
        </div>
    )
}

export default RoomScreen;