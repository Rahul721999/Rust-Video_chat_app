use actix::{fut, ActorContext, ActorFuture, ContextFutureSpawner, WrapFuture};
use actix::{Actor, Addr, Running, StreamHandler};
use actix::{AsyncContext, Handler};
use actix_web_actors::ws;
use uuid::Uuid;
use crate::lobby::Lobby;
use crate::messages::*;

/// 
/// websocket struct..
/// 
#[derive(Clone)]
pub struct MyWs{
    roomId: Uuid, /* room id where all people can be broadcast msg to others */
    id : Uuid, /* ID of this particular websocket */
    lobby_addr: Addr<Lobby>, /* Address of the all recipient present in this room */
}

/// 
/// MyWs methods...
/// 
impl MyWs{
    // Method to create new WebSocket
    pub fn new(room: Uuid, lobby: Addr<Lobby>) -> Self{
        Self{
            roomId : room,
            id: Uuid::new_v4(),
            lobby_addr: lobby,
        }
    }
}

///
/// Make this struct an 'Actor' by impl Actor trait for MyWs...
/// 
impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;
    
    /// handle task when websocket started...
    fn started(&mut self, ctx: &mut Self::Context) {
        // println!("Step 2 -> MyWs Started method called");
        let addr = ctx.address();
        self.lobby_addr
            .send(ConnectMsg {
                rec_addr: addr.recipient(),
                room_id: self.roomId,
                self_id: self.id,
            })
            .into_actor(self)
            .then(|res, _, ctx| {
                match res {
                    Ok(_res) => (),
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }
    fn stopping(&mut self, _ctx: &mut Self::Context) -> Running {
        self.lobby_addr
            .do_send(DisconnectMsg{
                self_id: self.id,
                room_id:self.roomId,
            });
            Running::Stop
    }
}

/// 
/// Handler for WebSocket Stream...
/// 
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            Ok(ws::Message::Text(s)) => self.lobby_addr.do_send(ClientActorMsg{
                id : self.id, 
                msg: s.to_string(),
                room_id: self.roomId,
            }),
            Err(e) => panic!("{}",e),
            _=> ()
        }
    }
}

///
/// Handle Messages of specific type...
/// 
impl Handler<WsMessage> for MyWs{
    type Result = ();
    fn handle(&mut self, msg: WsMessage, ctx: &mut Self::Context) -> Self::Result {
        ctx.text(msg.0)
    }
}