use actix::prelude::{Message, Recipient};
use uuid::Uuid;


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

#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientActorMsg{
    pub id: Uuid,
    pub room_id: Uuid,
    pub msg : String,
}