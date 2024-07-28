use crate::schema::message_schema::Message;
use log::{error, info};

// handle diff type of websocket messages
pub fn handle_msg(msg: String) -> Result<(), ()> {
    let msg: Message = match serde_json::from_str(&msg) {
        Ok(msg) => msg,
        Err(_) => {
            error!("Failed to parse the msg");
            return Err(())
        }
    };
    match msg {
        Message::Broadcast(msg) => broadcast_msg(msg.sender, msg.text),
        Message::Forward(msg) => forward_msg(msg.sender, msg.reciever, msg.text)
    }
}

/// broadcast msg to everyone in the same room
fn broadcast_msg(email: String, text: String) -> Result<(), ()> {
    info!("User: {email}, send a msg: {text}");
    Ok(())
}

/// forward msg to specific sender
fn forward_msg(sender: String, reciever: String, text: String) -> Result<(), ()> {
    info!("sender: {sender} reciever: {reciever} msg:{text}");
    Ok(())
}
