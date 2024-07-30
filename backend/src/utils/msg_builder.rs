use crate::schema::message_schema::{MsgType, NotificationMsg, OutgoingMsg, RoomIdMsg};

pub fn create_joined_msg(email: &str)-> String{
    let joined_msg = format!("{} has joined the room", email);
    
    OutgoingMsg::Notification(NotificationMsg {
        msg_type: MsgType::Notification,
        msg: joined_msg.to_string(),
    }).to_string()
}


pub fn create_room_id_msg(room_id: uuid::Uuid)-> String{    
    OutgoingMsg::RoomId(RoomIdMsg{
        msg_type: MsgType::RoomId,
        room_id
    }).to_string()
}