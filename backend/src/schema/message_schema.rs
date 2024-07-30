use std::fmt;

use serde::{Deserialize, Serialize};

/* --------------------------------------Message type expected from the client-------------------------------------- */

#[derive(Debug, Serialize, Deserialize)]
pub enum IncomingMsg {
    Forward(Forward),
    Broadcast(Broadcast),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InfoMessage {
    pub msg: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Forward {
    pub sender: String,
    pub reciever: String,
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Broadcast {
    pub sender: String,
    pub text: String,
}

/* ------------------------------------Message type, expected by the client------------------------------------ */
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MsgType{
    RoomId,
    Notification,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)] 
pub enum OutgoingMsg {
    RoomId(RoomIdMsg),
    Notification(NotificationMsg),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoomIdMsg {
    #[serde(rename="type")]
    pub msg_type: MsgType,
    #[serde(rename="roomId")]
    pub room_id: uuid::Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationMsg{
    #[serde(rename="type")]
    pub msg_type: MsgType,
    pub msg: String,
}


// Implement Display for OutgoingMsg
impl fmt::Display for OutgoingMsg {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            OutgoingMsg::RoomId(room_id_msg) => write!(
                f,
                "RoomId Message - Type: {:?}, Room ID: {}",
                room_id_msg.msg_type, room_id_msg.room_id
            ),
            OutgoingMsg::Notification(notification_msg) => write!(
                f,
                "Notification Message - Type: {:?}, Message: {}",
                notification_msg.msg_type, notification_msg.msg
            ),
        }
    }
}