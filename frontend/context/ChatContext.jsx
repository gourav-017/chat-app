import  { createContext,useEffect,useContext,useState } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const ChatContext =createContext();

export const ChatProvider = ({children}) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const[unseenMessages, setUnseenMessages] = useState({}); // {userId: unseenCount}
    
    const {socket,axios}= useContext(AuthContext);

    //function to get all users for sidebar
    const getUsers=async () => {
        try {
            const {data} = await axios.get('/api/messages/users');
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }

        } catch (error) {
            toast.error("Error fetching users:", error.messages);
        }
    }
    
//function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
             
            }
        } catch (error) {
            toast.error("Error fetching messages:", error.message);
        }
    }
    //function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);}
         else {
            toast.error(data.message || "Failed to send message");
        }
    }   
        catch (error) {
            toast.error("Error sending message:", error.message);
        }
    }
    //function to subscribe to new messages
    const subscribeToMessages = async() => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id) {
               newMessage.seen = true; // Mark as seen if it's for the selected user
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else
            {
                // Update unseen messages count for the sender
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }));
            }

        });

            
    };
    //function to unsubscribe from new messages
    const unsubscribeFromMessages = () => { 
        if(socket) socket.off("newMessage");
    }
    //
        useEffect(() => {
            subscribeToMessages();
             return () =>  unsubscribeFromMessages();
        }, [socket,selectedUser]);



    const  value={
        messages, users, selectedUser  , getUsers, sendMessage, setSelectedUser,unseenMessages,setUnseenMessages, getMessages
        // Define any state or functions you want to provide to the context
        // For example, you might have a state for current chat, messages, etc. 


    }
    return (
        <ChatContext.Provider value={value}>   
            {children}
        </ChatContext.Provider>         
    )
}