use crate::schema::{
    db::{Lobby, SendMessage},
    message_schema::IncomingMsg,
};
use log::{debug, error};
use std::sync::{Arc, Mutex, MutexGuard};

// handle diff type of websocket messages
pub fn handle_msg(lobby: &mut Arc<Mutex<Lobby>>, msg: String) {
    let msg: IncomingMsg = match serde_json::from_str(&msg) {
        Ok(msg) => msg,
        Err(_) => {
            error!("Failed to parse the msg");
            return;
        }
    };

    let lobby = {
        if let Ok(lobby) = lobby.lock() {
            lobby
        } else {
            error!("failed to get the lock on Mutex, while broadcasting");
            return;
        }
    };

    match msg {
        IncomingMsg::Broadcast(msg) => broadcast_msg(lobby, &msg.sender, msg.text),
        IncomingMsg::Forward(msg) => forward_msg(lobby, msg.sender, msg.reciever, msg.text),
    }
}

/// broadcast msg to everyone in the same room
pub fn broadcast_msg(lobby: MutexGuard<Lobby>, email: &str, text: String) {

    match lobby.get_room_id(email) {
        Some(room_id) => {
            lobby.broadcast(room_id, &text, email);
        }
        None => {
            error!("User's room_id not found");
        }
    }
}

/// forward msg to specific sender
fn forward_msg(lobby: MutexGuard<Lobby>, sender: String, reciever: String, text: String) {
    debug!("sender: {sender} reciever: {reciever} msg:{text}");
    match lobby.user.get(&reciever) {
        Some(reciever) => {
            reciever.do_send(SendMessage(text));
        }
        None => {
            error!("Reciever not found");
        }
    }
}
