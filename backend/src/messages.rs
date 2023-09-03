use actix::prelude::{Message, Recipient};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

///
/// WebSocket messages
/// 
#[derive(Message)]
#[rtype(result = "()")]
pub struct WsMessage(pub String); // Actual message passing through WebSocket


///
/// Message to deliver when Connected..
/// 
#[derive(Message)]
#[rtype(result = "()")]
pub struct ConnectMsg{
    pub rec_addr: Recipient<WsMessage>, /* addr of the recipients... */
    pub self_id : Uuid, /* socket id */
    pub room_id: Uuid, /* room id where the sockets are connected */
}



///
/// Message to deliver when someone gets Disconnected...
///  
#[derive(Message)]
#[rtype(result = "()")]
pub struct DisconnectMsg{
    pub self_id: Uuid,
    pub room_id: Uuid
}


///
/// Message recieved from the client...
/// 
#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientActorMsg{
    pub id: Uuid, /* socketID */
    pub room_id: Uuid, /* socketId connected to RoomID */
    pub msg : String, /* msg_data */
}

///
/// Msg in json from...
/// 
#[derive(Debug, Serialize, Deserialize)]
pub struct Messager{
    pub req_type: Request,
    pub email : String,
    pub room : String,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Request{
    CreateRoomReq,
    JoinReq,
}

/* Impl to_string() method for Request enum*/
impl ToString for Request{
    fn to_string(&self) -> String {
        match self{
            Self::CreateRoomReq => String::from("CreateRoomReq"),
            Self::JoinReq => String::from("JoinReq"),
        }
    }
}