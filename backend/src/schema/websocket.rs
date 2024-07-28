// src/websocket.rs

use crate::handle_msg::handle_msg;
use actix::prelude::*;
use actix_web_actors::ws;
use log::info;
use std::net::SocketAddr;

pub struct MyWebSocket {
    pub addr: SocketAddr,
    pub email: String,
}

impl Actor for MyWebSocket {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWebSocket {
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
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin), // just return the binary for the bin msg
            _ => (),
        }
    }
}
