import {React, useCallback, useEffect, useState} from 'react';
import {useSocket} from "../context/SocketProvider";
import { useNavigate } from 'react-router-dom';


/********************----------------- Lobby Screen -----------------********************/
const LobbyScreen = () => {

    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const socket = useSocket();
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }
    const handleRoomChange = (e) => {
        e.preventDefault();
        setRoom(e.target.value);
    }

    /* -------------------------------Handle Form Submition on-------------------------------*/
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault();

        // Send the form data along with req type(for later use)....
        socket.send(JSON.stringify({req_type: "JoinReq", email: email, room: room}));

    }, [email, room, socket]);

    /*------------------------------------ Handle Room Join req------------------------------------*/
    const handleRoomJoin = useCallback((e)=>{
        console.log('Room Join Req by: %s', e.email);
        navigate(`/room/${e.room}`)
    }, [navigate]);
    
    /*-------------------------------------Handle Diff REQ type-------------------------------------*/
    useEffect(()=>{
        socket.onmessage = (msg) => {
            const rec_msg = JSON.parse(msg.data);
            const type = rec_msg.req_type;
            switch (type) {
                case "JoinReq":{
                    handleRoomJoin(rec_msg);
                    break;
                }
                default:
                    console.log("ReqType not defined");
                    break;
            }
        }
 
    }, [socket, handleRoomJoin]);

    return (<div>
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
    </div>)
}

export default LobbyScreen;
