import React, { createContext, useContext, useState, useEffect } from "react";
import { usePeerContext } from "./PeerProvidor.jsx";

const WScontext = createContext(null);

export const WSprovider = ({ children }) => {
    const [sender, setSender] = useState(null);
    const [socket, setWebSocket] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [onRoomIdSet, setOnRoomIdSet] = useState(null);
    const { createOffer, createAns, peer, myStream, remoteStream, setRemoteStream } = usePeerContext();

    const connect = (email, roomId = null) => {
        console.log(`connecting with email: ${email}`);
        setSender(email);
        const url = roomId
            ? `ws://localhost:8080/ws/?email=${encodeURIComponent(email)}&room=${roomId}`
            : `ws://localhost:8080/ws/?email=${encodeURIComponent(email)}`;
        console.debug(`${url}`);

        const newSocket = new WebSocket(url);
        setWebSocket(newSocket);

        newSocket.onopen = () => {
            console.debug('WebSocket connection established');
        };

        newSocket.onmessage = (event) => {
            console.log('🔖 Message from server:', event.data);
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
            setWebSocket(null);
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        const handleWebSocketMessage = async (message) => {
            try {
                switch (message.type) {
                    case 'RoomId':
                        setRoomId(message.roomId);
                        if (onRoomIdSet) onRoomIdSet(message.roomId);
                        break;
                    case 'UserJoined':
                        console.info(`${message.user_email} Joined`);
                        await handle_user_joined_event(newSocket);
                        break;
                    case 'Notification':
                        console.log(message.msg);
                        break;
                    case 'Offer-call':
                        console.info(`Incoming call from : ${message.sender}`);
                        await handle_offer(newSocket, email, message.sender, message.offer);
                        break;
                    case 'Call-Ans':
                        console.log(`call answered by: `, message.sender);
                        await handle_call_answered(newSocket, message.sender, message.ans);
                        break;
                    case 'UserLeft':
                        console.info(`${message.user_email} left the room`);
                        break;
                    case 'Ice-candidate':
                        console.info('ice-candidate recieved');
                        await handleIceCandidateEvent(message.candidate)
                        break;
                    case 'Req-trackId':
                        console.info("TrackId requested by:", message.sender);
                        await handleTrackIdReqEvent(newSocket, message.sender);
                        break;
                    case 'TrackId':
                        console.log(`TrackId recieved from: ${message.sender}, tracks: ${message.trackIds}`);
                        await handleTrackIdMsgEvent(remoteStream, message.tracks);
                        break;
                    default:
                        console.warn('Unknown message type:', message);
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        };

        /* ---------------------------------------User2-joined event--------------------------------------- */
        // use1 offering a call
        const handle_user_joined_event = async (socket) => {
            try {
                console.debug("creating offer for newly-joined user.")
                const offer = await createOffer(); // Create an offer when a user joins
                const offerMessage = {
                    Broadcast: {
                        sender: email,
                        text: JSON.stringify({ type: 'Offer-call', sender: email, offer }),
                    },
                };
                socket.send(JSON.stringify(offerMessage)); // Send the offer as a broadcast message
            } catch (error) {
                console.error('Failed to create offer:', error);
            }
        };

        /* ---------------------------------user1 offered a call to user2---------------------------------*/
        // user2 accepting call by creating an Answer for the offer
        const handle_offer = async (socket, sender, reciever, offer) => {
            try {
                if (peer.signalingState !== 'stable') {
                    console.warn('Peer connection is not in stable state. Ignoring offer.');
                    return;
                }

                console.debug("Answering call...");
                const ans = await createAns(offer); // create ans for the offer

                /* Forward the 'ans' to the person who offered the call stating,
                    you accepted the call, here's the ans. */
                const ansMessage = {
                    Forward: {
                        sender,
                        reciever,
                        text: JSON.stringify({ type: 'Call-Ans', sender, ans }),
                    },
                };
                socket.send(JSON.stringify(ansMessage));
                console.log(`🚩Call answered`);
            } catch (error) {
                console.error('Failed to handle Offer:', error);
            }
        };

        /* ------------------------------user2 accepted the call from user1------------------------------ */
        // Now user1 have to set the 'ans' to remote-description
        const handle_call_answered = async (socket, other_user, call_ans) => {
            try {
                if (peer.signalingState !== 'have-local-offer') {
                    console.warn('Peer connection is not in the correct state to handle answer.');
                    return;
                }

                console.info("Handling call-answered event");
                await peer.setRemoteDescription(new RTCSessionDescription(call_ans));
                req_remote_track_ids(other_user, socket);
            } catch (error) {
                console.error("Failed to handle call-answered event:", error);
            }
        };

        const req_remote_track_ids = (reciever, socket) => {
            console.debug('sending connection-established msg');
            const reqMsg = {
                Forward: {
                    sender: email,
                    reciever,
                    text: JSON.stringify({ type: 'Req-trackId', sender: email }),
                },
            };
            socket.send(JSON.stringify(reqMsg)); // Send the offer as a broadcast message
            console.debug("sent");
        }

        /* ----------------------------------Handling ICE-Candidate event---------------------------------- */
        // Everytime when new IceCandidate is found add it to the Peer.
        const handleIceCandidateEvent = async (candidate) => {
            try {
                console.info("handling Ice-Candidate Event")
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("failed to handle Ice-Candidate event: ", error);
            }
        }

        /* ------------------------------- Handling-track-req event------------------------------- */
        // sending the user's local tracks over the ws
        const handleTrackIdReqEvent = async (socket,reciever) => {
            try {
                // getting tracks from myStream
                let tracks = myStream.getTracks();

                // Extracting track IDs
                let trackIds = tracks.map(track => track.id);

                // Constructing the message to send
                const trackIdMsg = {
                    Forward: {
                        sender: email,
                        reciever,
                        text: JSON.stringify({ type: 'TrackId', trackIds: trackIds })
                    }
                };

                // Sending the message over WebSocket
                socket.send(JSON.stringify(trackIdMsg));
                console.log("Track IDs sent:", trackIds);

            } catch (error) {
                console.error("Failed to handle Track req event:", error);
            }
        };


        /* ----------------------------- Handling TrackId msg received ----------------------------- */
        // adding tracks received over ws to user1's remoteStream
        const handleTrackIdMsgEvent = async (remoteStream, trackIds) => {
            try {
                let remote_stream = null;
                // Create a new MediaStream to hold the remote tracks if not already set
                if (!remoteStream) {
                    remote_stream = new MediaStream();
                }

                // Iterate over each track ID received
                for (const trackId of trackIds) {
                    // Assuming peer.getReceivers() gives us access to the received tracks
                    const receiver = peer.getReceivers().find(r => r.track.id === trackId);

                    if (receiver) {
                        const track = receiver.track;
                        console.log(`Adding remote track: ${track.kind}, Track ID: ${track.id}`);
                        remote_stream.addTrack(track);
                    } else {
                        console.warn(`Track with ID ${trackId} not found in peer receivers.`);
                    }
                }

                // // Set the remote stream to the appropriate video element or context
                // if (remoteVideoRef.current) {
                //     remoteVideoRef.current.srcObject = remote_stream;
                //     console.info("Remote stream set on video element.");
                // }

                setRemoteStream(remote_stream);

            } catch (error) {
                console.error("Failed to handle TrackId message event:", error);
            }
        };


    };

    // Invokes the HandleIceCandidate event for new ICE-Candidate found event
    useEffect(() => {
        const handleICECandidate = (event) => {
            let candidate = event.candidate;
            if (candidate) {
                const candidateMessage = {
                    Broadcast: {
                        sender,
                        text: JSON.stringify({ type: 'Ice-candidate', candidate }),
                    },
                };
                socket.send(JSON.stringify(candidateMessage));
            }
        };

        peer.addEventListener('icecandidate', handleICECandidate);
        return () => {
            peer.removeEventListener('icecandidate', handleICECandidate);
        };
    }, [peer, socket, sender]);


    /* Socket Disconnect event */
    const disconnect = () => {
        if (socket) {
            socket.close();
        }
    };

    /*  */
    const registerOnRoomIdSet = (callback) => {
        setOnRoomIdSet(() => callback);
    };



    return (
        <WScontext.Provider value={{ socket, connect, disconnect, roomId, registerOnRoomIdSet }}>
            {children}
        </WScontext.Provider>
    );
};

export const useWebSocket = () => useContext(WScontext);
