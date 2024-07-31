// src/websocket.rs

use super::db::{Lobby, SendMessage};
use crate::{handle_msg::{broadcast_msg, handle_msg}, utils::msg_builder::{create_disconnect_msg, create_room_id_msg}};
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


    // handle websocket started event
    fn started(&mut self, ctx: &mut Self::Context) {
        let addr = ctx.address();
        // store the connection to the corresponding user
        if let Ok(mut lobby) = self.lobby.lock() {
            if let Some(roomid) = lobby.get_room_id(&self.email){
                let room_id_msg = create_room_id_msg(roomid);
                addr.do_send(SendMessage(room_id_msg));
            };
            lobby.store_ws_connection(&self.email, addr);
        } else {
            error!("Failed to get lock on mutex");
        }
    }


    // handle all diff types of ws messages
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg), // just return pong for ping msg
            Ok(ws::Message::Text(text)) => {
                handle_msg(&mut self.lobby, text);
            }
            Ok(ws::Message::Close(_msg)) => {
                handle_close(self);
                ctx.stop();
            }
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin), // just return the binary for the bin msg
            _ => (),
        }
    }
}

pub fn handle_close(ws: &mut MyWebSocket) {
    let email = ws.email.clone();
    let lobby = ws.lobby.clone();
    Arbiter::spawn(async move {
        if let Ok(lobby) = lobby.lock() {
            let msg = create_disconnect_msg(&email);
            broadcast_msg(lobby, &email, msg);
        }
        remove_user(&lobby, &email).await;
        info!("{email} Disconnected");
    });
}

pub async fn remove_user(lobby: &Arc<Mutex<Lobby>>, email: &str) {
    if let Ok(mut lobby) = lobby.lock() {
        if let Err(err) = lobby.remove_user(email) {
            error!("{err:?}");
        }
    }
}
