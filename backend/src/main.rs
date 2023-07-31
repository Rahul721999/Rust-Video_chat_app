use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use tungstenite::accept;
use std::{net::TcpListener, thread::spawn};

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

async fn connect_websocket(){
    let server = TcpListener::bind("0.0.0.0:8080").unwrap();

    for stream in server.incoming() {
        spawn (move || {
            let mut websocket = accept(stream.unwrap()).unwrap();
            loop {
                let msg = websocket.read().unwrap();
                // We do not want to send back ping/pong messages.
                if msg.is_binary() || msg.is_text() {
                    println!("Message recieved through WS: {}",msg.to_string().trim());
                    websocket.send(msg).unwrap();
                }
            }
        });
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    connect_websocket().await;
    HttpServer::new(|| {
        App::new()
            .route("/hey", web::get().to(manual_hello))
    })
    .bind(("127.0.0.1", 8888))?
    .run()
    .await
}