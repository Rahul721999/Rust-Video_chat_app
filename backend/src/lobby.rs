use std::collections::HashMap;
use std::collections::HashSet;
use actix::{Actor,Handler, Recipient, prelude::Context};
use uuid::Uuid;
use crate::messages::*;

///
/// Socket type
type Socket = Recipient<WsMessage>;

/// struct to manage sessions..
/// 
pub struct Lobby{
    sessions: HashMap<Uuid, Socket>, /*  Id to Socket */
    rooms: HashMap<Uuid, HashSet<Uuid>> /* Room ID to list of user */ 
}


/// 
/// methods for Lobby struct...
/// 
impl Lobby{
    
    pub fn default()-> Self{
        Self{ 
            sessions: HashMap::new(),   
            rooms: HashMap::new()
        }
    }

    /// fn to send message to partcular id in SocketRoom..
    pub fn send_message(&self, msg: &str, id_to: &Uuid){
        // if recipient addr is available..
        if let Some(socket_recipient) = self.sessions.get(id_to){
            let _ = socket_recipient.do_send(WsMessage(msg.to_owned()));
        }else{
            println!("Failed to send msg, as socket addr is not available")
        }
    }
}

///
///  Make this struct an 'Actor' by impl Actor trait for MyWs...
/// 
impl Actor for Lobby{
    type Context = Context<Self>;
}


///
/// when someone joines the Room
/// 
/// 
impl Handler<ConnectMsg> for Lobby{
    type Result = ();
    fn handle(&mut self, msg: ConnectMsg, _: &mut Self::Context) -> Self::Result {
        // println!("Step 3 -> Broadcast connectMSG in Lobby");
        /* ------------------- add new user or websocket id to the room------------------- */
        self.rooms.entry(msg.room_id) // add new websocket id to the room
            .or_insert_with(HashSet::new)// or create a new room if not present
                .insert(msg.self_id);// then insert the new ws_id


            
            

        /* -------------------- send msg to the room when someone joined -------------------- */
        self.rooms
            .get(&msg.room_id) // get the reciver address from room
            .expect("failed to get reciever address from the room")
            .iter()
            .filter(|conn_id| *conn_id.to_owned() != msg.self_id)
            .for_each(|user_id| self.send_message(&format!("{} Just joined", msg.self_id), user_id));

        self.sessions.insert(
            msg.self_id, 
            msg.rec_addr
        );

        self.send_message(&format!("Your id is: {}", msg.self_id), &msg.self_id);
    }
}


///
/// when someone gets disconnected from the room
/// 
impl Handler<DisconnectMsg> for Lobby{
    type Result = ();
    fn handle(&mut self, msg: DisconnectMsg, _: &mut Self::Context) -> Self::Result {
        // println!("Handle DisconnectMSG");
        /*----------------------- remove user from the room -----------------------*/
        if self.rooms.remove(&msg.self_id).is_some(){

            /* -------------------- send msg to all member present in room except the user left --------------------*/
            self.rooms
                .get(&msg.room_id)
                .expect("failed to get room id on DisconnectMsg")
                .iter()
                .filter(|conn_id| *conn_id.to_owned() != msg.self_id) /* filter out rest of the msg id other than the user Disconnected */
                .for_each(|user_id| self.send_message(&format!("{} disconnected", &msg.self_id), user_id));
            if  let Some( lobby) = self.rooms.get_mut(&msg.room_id){
                if lobby.len() > 1{
                    lobby.remove(&msg.self_id);
                }else{
                    self.rooms.remove(&msg.room_id);
                }
            }

        }
    }
}

///
/// 
impl Handler<ClientActorMsg> for Lobby{
    type Result = ();
    fn handle(&mut self, msg: ClientActorMsg, _: &mut Self::Context) ->Self::Result{
        // println!("Step 3 -> Broadcast ClientMSG in Lobby");
        if msg.msg.starts_with("\\w") {
            if let Some(id_to) = msg.msg.split(' ').collect::<Vec<&str>>().get(1){
                self.send_message(&msg.msg, &Uuid::parse_str(id_to).expect("Failed to parse string to Uuid"))
            }
        }else{
            self.rooms.get(&msg.room_id).expect("failed to get room id")
                .iter().for_each(|client|self.send_message(&msg.msg, client))

        }
    }
}