use crate::schema::message_schema::{MsgType, OutgoingMsg, RoomIdMsg, UserJoinedMsg};

pub fn create_joined_msg(user_email: &str)-> String{
 
    OutgoingMsg::UserJoined(UserJoinedMsg {
        msg_type: MsgType::UserJoined,
        user_email: user_email.to_owned()
    }).to_string()
}


pub fn create_room_id_msg(room_id: uuid::Uuid)-> String{    
    OutgoingMsg::RoomId(RoomIdMsg{
        msg_type: MsgType::RoomId,
        room_id
    }).to_string()
}
