mod socket;
use socket::connect_websocket;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};



async fn healthcheck() -> impl Responder {
    HttpResponse::Ok().body("Health-check Successfull")
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use std::collections::HashMap;
    let mut user_to_room_id: HashMap<String, String> = HashMap::new();

    connect_websocket();
    HttpServer::new(|| {
        App::new()
            .route("/check", web::get().to(healthcheck))
    })
    .bind(("127.0.0.1", 8888))?
    .run()
    .await
}