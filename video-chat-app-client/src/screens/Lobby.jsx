import React, {useCallback, useEffect, useState} from 'react';
import {ConnectSocket} from "../context/SocketProvider";
import { useNavigate } from 'react-router-dom';

/********************----------------- Lobby Screen -----------------********************/
const LobbyScreen = () => {

    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }
    const handleRoomChange = (e) => {
        e.preventDefault();
        setRoom(e.target.value);
    }
    /*------------------------------------ Handle Room Join req------------------------------------*/
    const handleRoomJoin = useCallback((rec_msg) => {
        navigate(`/room/${rec_msg.room}`)
    }, []);
    /* -------------------------------Handle Form Submition on-------------------------------*/
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault();
        setSocket(ConnectSocket(email, room));
    }, [room, email, socket]);


    /* -------------------------------Handle Diff Req type-------------------------------*/
    useEffect(() => {
        if (handleFormSubmit && socket) {
            socket.onmessage = (msg) => {
                const rec_msg = JSON.parse(msg.data);
                const type = rec_msg.req_type;
                if (type != null){
                    switch (type) {
                        case "CreateRoomReq":{
                            handleRoomJoin(rec_msg);
                            break;
                        }
                        case "JoinReq": {
                            handleRoomJoin(rec_msg);
                            break;
                        }
                        case "MsgOnly": {
                            console.log(rec_msg.msg);
                            break;
                        }
                        default:
                            console.log("Req type not defined");
                            break;
                }}
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
