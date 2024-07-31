use actix::{Addr, Handler};
use actix_web::HttpResponse;
use log::{debug, info};
use std::collections::HashMap;
use uuid::Uuid;

use crate::utils::msg_builder::create_joined_msg;

use super::websocket::MyWebSocket;
pub struct Lobby {
    pub room: HashMap<Uuid, Vec<String>>, // HashMap{RoomId, Vec<Email>}
    pub user: HashMap<String, Addr<MyWebSocket>>, // HashMap{Email, SocketAddr}

    // to find the roomId of the user
    pub user_in_room: HashMap<String, Uuid>, // HashMap{Email, Uuid}
}

impl Lobby {
    pub fn new() -> Self {
        Self {
            room: HashMap::new(),
            user: HashMap::new(),
            user_in_room: HashMap::new(),
        }
    }

    // for new user create new room
    pub fn insert(&mut self, user_email: String) {
        // create new room for 1st user
        let new_room_id = Uuid::new_v4();
        info!("new roomId created: {new_room_id}");
        // store newly created room id with a new vector inserting the new user init
        self.room.insert(new_room_id, vec![user_email.clone()]);
        self.user_in_room.insert(user_email, new_room_id);
    }

    pub fn store_ws_connection(&mut self, email: &str, connection: Addr<MyWebSocket>) {
        self.user.insert(email.to_string(), connection);
    }

    // for user who wants to join a existing room
    pub fn join_room(&mut self, user_email: &str, room_id: Uuid) -> Result<(), HttpResponse> {
        if let Some(room) = self.room.get_mut(&room_id) {
            room.push(user_email.to_owned());
            self.user_in_room.insert(user_email.to_owned(), room_id);
            debug!("{user_email} added to room : {room_id}");
            debug!("room updated: {:?}", room);

            let someone_joined_msg = create_joined_msg(user_email);
            self.broadcast(room_id, &someone_joined_msg, user_email);
            Ok(())
        } else {
            Err(HttpResponse::NotFound().finish())
        }
    }

    // fn to remove user from the room
    pub fn remove_user(&mut self, user_email: &str) -> Result<(), HttpResponse> {
        if self.user.is_empty() || self.user.get(user_email).is_none() {
            return Err(HttpResponse::NotFound().body("User not found"));
        }
        // Find the room ID of the user
        let room_id = match self.user_in_room.get(user_email) {
            Some(id) => *id,
            None => return Err(HttpResponse::NotFound().body("User not found in any room")),
        };

        self.user.remove(user_email);
        self.user_in_room.remove(user_email);

        Self::delete_room_if_empty(self, room_id, user_email);

        Ok(())
    }

    // fn to check if the room is empty after last user dropped
    fn delete_room_if_empty(&mut self, room_id: Uuid, user_email: &str) {
        if let Some(room) = self.room.get_mut(&room_id) {
            room.retain(|email| email != user_email); // Remove the user from the room

            // If the room is empty, delete it
            if room.is_empty() {
                self.room.remove(&room_id);
                info!("Room {} deleted as it is now empty", room_id);
            }
        }
    }

    // Get the room ID of a user
    pub fn get_room_id(&self, user_email: &str) -> Option<Uuid> {
        self.user_in_room.get(user_email).cloned()
    }

    // Broadcast a message to all users in a room
    pub fn broadcast(&self, room_id: Uuid, message: &str, sender_email: &str) {
        if let Some(users) = self.room.get(&room_id) {
            for user_email in users {
                if let Some(addr) = self.user.get(user_email) {
                    if user_email != sender_email {
                        info!("Broadcasting message to {}", user_email);
                        addr.do_send(SendMessage(message.to_owned()));
                    }
                }
            }
        }
    }
}

/* This implementation is necessary to send messages using the websocket address*/
pub struct SendMessage(pub String);

impl actix::Message for SendMessage {
    type Result = ();
}

impl Handler<SendMessage> for MyWebSocket {
    type Result = ();

    fn handle(&mut self, msg: SendMessage, ctx: &mut Self::Context) {
        ctx.text(msg.0); // Send the message to the WebSocket client
    }
}
