import React, {useCallback, useEffect, useState} from 'react';
import {ConnectSocket} from "../context/SocketProvider";

/********************----------------- Lobby Screen -----------------********************/
const LobbyScreen = () => {

    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const [socket, setSocket] = useState(null);

    const handleEmailChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }
    const handleRoomChange = (e) => {
        e.preventDefault();
        setRoom(e.target.value);
    }
    /*------------------------------------ Handle Room Join req------------------------------------*/
    const handleRoomJoin = useCallback(() => {
        console.log('Room Join Req by: %s', email);
    }, []);
    /* -------------------------------Handle Form Submition on-------------------------------*/
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault();
        setSocket(ConnectSocket(room));
        
    }, [room]);

    
    useEffect(() => {
        if( handleFormSubmit && socket){
            socket.onmessage = (e)=>{
                console.log(e.data)
            }
        }
    }, [socket, room, handleFormSubmit]);


    /*-------------------------------------Handle Diff REQ type-------------------------------------*/

    return (
        <div>
            <h1>Lobby</h1>
            <form>
                <label htmlFor='email'>Email:</label>
                <input type='email' id="email"
                    onChange={handleEmailChange}></input>
                <label htmlFor='room'>Room No:</label>
                <input type='text' id="room"
                    onChange={handleRoomChange}></input>
                <button onClick={handleFormSubmit}
                    type='submit'>Join</button>
            </form>
        </div>
    )
    
}

export default LobbyScreen;
