import {React, useCallback, useState} from 'react';
const socket = new WebSocket('ws://localhost:8080/ws');
const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

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
        socket.send(email);
        socket.onmessage = (e) =>{
            console.log(e.data)
        }
        console.log({email, room})
    }, 
    [email, room])
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
