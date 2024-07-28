use crate::schema::{db::Lobby, websocket::MyWebSocket};
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use log::error;
use std::sync::{Arc, Mutex};

/// API to Start WS by adding user to the existing room or create new one.
pub async fn start_ws_connection(
    req: HttpRequest,
    stream: web::Payload,
    lobby: web::Data<Arc<Mutex<Lobby>>>, // Use the lobby if needed
    email: web::Path<String>,            // Extract the email & roomId parameter
) -> Result<HttpResponse, Error> {
    // Get the client's socket address
    let addr = req.peer_addr().ok_or_else(|| {
        actix_web::error::ErrorInternalServerError("Could not get client address")
    })?;
    println!("Client address: {:?}", addr);

    // Create the WebSocket actor
    let email: String = email.into_inner();
    let ws = MyWebSocket {
        addr,
        email: email.clone(),
    };

    if let Ok(mut lobby) = lobby.lock().map_err(|err| {
        error!("Failed to get lock on Lobby AppState: {}", err);
    }) {
        lobby.insert(email, addr);
    }

    // Start the WebSocket session
    ws::start(ws, &req, stream)
}
