#![allow(unused)]
use tungstenite::{accept, Message};
use std::{net::TcpListener, thread::spawn, collections::HashMap};
use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Debug,Serialize, Deserialize)]
struct Messager{
    req_type: String,
    email : String,
    room : String,
}

pub fn connect_websocket(){
    let server = TcpListener::bind("127.0.0.1:8080").expect("❗failed to bind address");

    for stream in server.incoming() {

 
        /*------------------- Spawn a new thread------------------- */
        spawn (move || {
            let mut websocket = 
                accept(stream.expect("❗failed to accept stream"))
                    .expect("❗failed to get websocket");
            /*------------continue recieving msg untill connection lost------------*/
            loop {
                
                // get the msg from websocket ----------------->
                let msg = websocket.read().unwrap();
                println!("✅ Message recieved through WS: {}",msg.to_string().trim());
                
                // parse the json ----------->
                let data: Messager = serde_json::from_str(msg.to_string().trim()).expect("❗failed to parse the JSON data");
                

                if msg.is_binary() || msg.is_text() {
                    match data.req_type.as_str(){
                        "JoinReq" =>{
                            websocket.send(msg).expect("❗failed to send msg to websocket server");
                        },
                        _ => websocket.send(msg).expect("❗failed to send msg to websocket server"),
                    }
                }
            }
        });
    }
}