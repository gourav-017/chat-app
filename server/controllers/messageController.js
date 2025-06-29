import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js"; // Import cloudinary for image upload
import { io,userSocketMap } from "../server.js";

// Get all User except logged in user

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID from the request
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password"); // Exclude the logged-in user and password field
    const unseenMessages = {};
    const promises=filteredUsers.map(async (user) => {
      const message = await Message.find({senderId: user._id, receiverId: userId, seen: false})
      if(message.length > 0) {
        unseenMessages[user._id] = message.length; // Count unseen messages for each user
      }
    });
    await Promise.all(promises); // Wait for all promises to resolve
    res.status(200).json({ success: true, users : filteredUsers, unseenMessages });
  } catch (error) {
    console.error("Error fetching users for sidebar:", error.message);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

// et all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const {id:selectedUserId} = req.params; // Get the selected user ID from the request parameters

        const myId=req.user._id; // Get the logged-in user's ID from the request
        // Fetch messages between the logged-in user and the selected user
          const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId}, {seen: true});
        res.status(200).json({ success: true, messages });
        
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

// api to mark message as seen using messae id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params; // Get the message ID from the request parameters
        await Message.findByIdAndUpdate(id, { seen: true });
        res.status(200).json({ success: true, message: "Message marked as seen"});
    } catch (error) {
        console.error("Error marking message as seen:", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

// send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image} = req.body; // Get message details from the request body
        const receiverId = req.params.id; // Get the receiver's user ID from the request parameters
        const senderId = req.user._id; // Get the logged-in user's ID from the request
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image) 
           imageUrl= uploadResponse.secure_url;
        }
        // Create a new message document
        const newMessage =  Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl || null, // Use the uploaded image URL or null if no image is provided
        })
        
        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)      
        }
        res.status(201).json({ success: true, message: "Message sent successfully", newMessage });
        
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}   