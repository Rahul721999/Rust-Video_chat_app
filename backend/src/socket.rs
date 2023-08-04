#![allow(unused)]
use tungstenite::accept;
use std::{net::TcpListener, thread::spawn};
use serde::Deserialize;


#[derive(Debug, Deserialize)]
struct Messager{
    email : String,
    room_no : u8,
}

pub async fn connect_websocket(){
    let server = TcpListener::bind("127.0.0.1:8080").unwrap();

    for stream in server.incoming() {
        spawn (move || {
            let mut websocket = accept(stream.unwrap()).unwrap();
            loop {
                let msg = websocket.read().unwrap();
                
                if msg.is_binary() || msg.is_text() {
                    println!("Message recieved through WS: {}",msg.to_string().trim());
                    websocket.send(msg).unwrap();
                }
            }
        });
    }
}