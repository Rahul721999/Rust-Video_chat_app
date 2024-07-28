// src/websocket.rs

use super::db::Lobby;
use crate::handle_msg::handle_msg;
use actix::prelude::*;
use actix_web_actors::ws;
use log::{error, info};
use std::sync::{Arc, Mutex};

pub struct MyWebSocket {
    pub email: String,
    pub lobby: Arc<Mutex<Lobby>>,
}

impl Actor for MyWebSocket {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWebSocket {
    fn started(&mut self, ctx: &mut Self::Context) {
        let addr = ctx.address();
        // store the connection to the corresponding user
        if let Ok(mut lobby) = self.lobby.lock(){
            lobby.store_ws_connection(&self.email, addr);
        }else{
            error!("Failed to get lock on mutex");
        }
    }
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg), // just return pong for ping msg
            Ok(ws::Message::Text(text)) => {
                info!("Recieved: {text} from {}", self.email);
                if handle_msg(text).is_err() {
                    ctx.text("Failure");
                }
                ctx.text("Success");
            }
            Ok(ws::Message::Close(_msg)) => {
                let email = self.email.clone();
                let lobby = self.lobby.clone();
                Arbiter::spawn(async move {
                    info!("{email} Disconnected");
                    broadcast(lobby, &email, format!("{} disconnected", &email)).await;
                });
                ctx.stop();
            }
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin), // just return the binary for the bin msg
            _ => (),
        }
    }
}


pub async fn broadcast(lobby: Arc<Mutex<Lobby>>, email: &str, msg: String) {
    let lobby = {
        if let Ok(lobby) = lobby.lock() {
            lobby
        } else {
            error!("failed to get the lock on Mutex, while broadcasting");
            return;
        }
    };

    if let Some(room_id) = lobby.get_room_id(email) {
        lobby.broadcast(room_id, &msg, email)
    } else {
        error!("Failed to get the user's roomId")
    }
}
