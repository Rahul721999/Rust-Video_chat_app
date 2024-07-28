use serde::{Serialize, Deserialize};

// diff type of messages
#[derive(Debug, Serialize, Deserialize)]
pub enum Message{
    Forward(Forward),
    Broadcast(Broadcast),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Forward{
    pub sender: String,
    pub reciever: String,
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Broadcast{
    pub sender : String,
    pub text: String,
}