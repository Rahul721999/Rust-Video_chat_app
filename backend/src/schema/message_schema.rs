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
pub enum MsgType {
    RoomId,
    UserJoined,
    Notification,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum OutgoingMsg {
    RoomId(RoomIdMsg),
    UserJoined(UserJoinedMsg),
    Notification(NotificationMsg),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoomIdMsg {
    #[serde(flatten)]
    pub msg_type: MsgType,
    #[serde(rename = "roomId")]
    pub room_id: uuid::Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationMsg {
    #[serde(flatten)]
    pub msg_type: MsgType,
    pub msg: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserJoinedMsg {
    #[serde(flatten)]
    pub msg_type: MsgType,
    pub user_email: String,
}

// Implement Display for OutgoingMsg
impl fmt::Display for OutgoingMsg {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let json_message = serde_json::to_string(self).map_err(|_| fmt::Error)?;
        write!(f, "{}", json_message)
    }
}