use actix_web::{HttpRequest,web::{Path, Payload, Data}, HttpResponse, Error, get};
use actix_web_actors::ws;
use uuid::Uuid;
use actix::Addr;
use crate::lobby::Lobby;
use crate::server::MyWs;

///
/// this fn is responsible to start a new websocket connection
/// 
#[get("/{group_id}")]
pub async fn connect_socket(
    req: HttpRequest,
    stream: Payload,
    Path(group_id): Path<Uuid>,
    srv: Data<Addr<Lobby>>
)->Result<HttpResponse, Error>{
    // println!("step 1-> Connect_socket called");
    let ws = MyWs::new(
        group_id,
        srv.as_ref().clone()
    );
    let resp = ws::start(ws, &req, stream)
        .expect("failed to connect websocket");
    Ok(resp)
}