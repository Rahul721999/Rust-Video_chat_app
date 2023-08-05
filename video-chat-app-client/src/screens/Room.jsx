import React, {useCallback, useEffect, useState} from "react"
import { useSocket } from "../context/SocketProvider";





const RoomScreen = ()=>{
    const socket = useSocket(); 
    const [remoteSocketId, setRSI] = useState(null);
    const [myStream, setMyStream] = useState();

    /* ----------------------------Handle call req----------------------------*/
    const handleCall = () =>{

    }

    /* -----------------------Handle Room Joined event-----------------------*/
    const handleRoomJoined = useCallback(({email, roomId}) =>{
        console.log(`Email : ${email} Joined the room.`)
    }, [])
    useEffect(()=>{
        
    }, [])

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