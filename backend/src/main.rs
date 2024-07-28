mod schema;
mod handle_msg;
mod api;
use schema::db::Lobby;
use api::lobby::start_ws_connection;

use std::sync::{Arc, Mutex};
use actix_web::*;
use web::Data;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize the logger with a default log level
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    
    let lobby = Data::new(Arc::new(Mutex::new(Lobby::new())));
    HttpServer::new(move || {
        App::new()
            .app_data(lobby.clone())
            .route("/ws/{email}", web::get().to(start_ws_connection))

    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}