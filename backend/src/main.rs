#![allow(non_snake_case)]
use actix::Actor;
use actix_web::{App, HttpServer};
mod server;
mod lobby;
mod messages;
mod connect;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let chat_server = lobby::Lobby::default().start();
    HttpServer::new(move || 
        App::new()
            .service(connect::connect_socket)
            .data(chat_server.clone())
    )
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}