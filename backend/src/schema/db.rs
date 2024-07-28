use std::{collections::HashMap, net::SocketAddr};
use uuid::Uuid;
pub struct Lobby {
    pub room: HashMap<Uuid, Vec<String>>, // HashMap{RoomId, Vec<Email>}
    pub user: HashMap<String, SocketAddr>, // HashMap{Email, SocketAddr}

    // to find the roomId of the user
    pub user_in_room : HashMap<String, Uuid> // HashMap{Email, Uuid}
}

impl Lobby {
    pub fn new() -> Self {
        Self {
            room: HashMap::new(),
            user: HashMap::new(),
            user_in_room: HashMap::new()
        }
    }

    // for new user create new room
    pub fn insert(&mut self, user_email: String, socket: SocketAddr){
        // create new room for 1st user
        let new_room_id = Uuid::new_v4();

        // store user email & corresponding socketAddr to db
        self.user.insert(user_email.clone(), socket);
        
        // store newly created room id with a new vector inserting the new user init
        self.room.insert(new_room_id, vec![user_email.clone()]);

        // this 
        self.user_in_room.insert(user_email, new_room_id);
    }

    // Get the room ID of a user
    pub fn _get_room_id(&self, user_email: &str) -> Option<Uuid> {
        self.user_in_room.get(user_email).cloned()
    }

    // Broadcast a message to all users in a room
    pub fn _broadcast(&self, room_id: Uuid, message: &str, sender_email: &str) {
        if let Some(users) = self.room.get(&room_id) {
            for user_email in users {
                if let Some(_addr) = self.user.get(user_email) {
                    if user_email != sender_email {
                        println!("Sending message to {}: {}", user_email, message);
                    }
                }
            }
        }
    }
}
