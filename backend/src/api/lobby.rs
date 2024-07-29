use crate::schema::{db::Lobby, websocket::MyWebSocket};
use actix_web::{
    error,
    web::{self, Query},
    Error, HttpRequest, HttpResponse,
};
use actix_web_actors::ws;
use log::error;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct User {
    email: String,
    room: Option<Uuid>,
}

/// API to Start WS by adding user to the existing room or create new one.
pub async fn start_ws_connection(
    req: HttpRequest,
    stream: web::Payload,
    lobby: web::Data<Arc<Mutex<Lobby>>>, // Use the lobby if needed
    query: Query<User>,                   // Extract the email & roomId parameter
) -> Result<HttpResponse, Error> {
    // Create the WebSocket actor

    let email = &query.email;
    let ws = MyWebSocket {
        email: email.clone(),
        lobby: lobby.get_ref().clone(),
    };

    if let Ok(mut lobby) = lobby.lock().map_err(|err| {
        error!("Failed to get lock on Lobby AppState: {}", err);
    }) {
        // check if the user wants to join existing room
        if let Some(room_id) = query.room {
            if lobby.join_room(email, room_id).is_err() {
                return Err(error::ErrorInternalServerError("Room Id doesn't exists"));
            }
        } else {
            lobby.insert(email.to_string());
        }
    }

    // Start the WebSocket session
    ws::start(ws, &req, stream)
}
