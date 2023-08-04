import {React, useCallback, useState} from 'react';
import {useSocket} from "../context/SocketProvider";


const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const socket = useSocket();

    const handleEmailChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }
    const handleRoomChange = (e) => {
        e.preventDefault();
        setRoom(e.target.value);
    }
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault();

        socket.send(JSON.stringify({email: email, room: room}));

        socket.onmessage = (msg) => {
            let rec_msg = JSON.parse(msg.data);
            console.log('"%s" joined the room', rec_msg.email);
        }

    }, [email, room, socket]);
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
