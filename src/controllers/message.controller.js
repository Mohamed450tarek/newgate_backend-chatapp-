//import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
 import asyncHandler from 'express-async-handler';
 import  ApiError from '../utils/apiError.js';
 import mongoose from "mongoose";

 export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const me = await User.findById(loggedInUserId).select("friends");

    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await User.find({
      _id: { $in: me.friends }
    }).select("-password  -friendRequests -sentRequests  -__v    " )  
    .lean();




    res.status(200).json( {success : true  ,  result :  friends});
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get chat massage 


  export const getchatmassage = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;

  // 1) Check friend exists
  const friend = await User.findById(friendId);
  if (!friend) {
    return next(new ApiError("No friend with this id", 404));
  }

  // 2) Check friendship
  const me = await User.findById(req.user._id);
  if (!me.friends.includes(friendId)) {
    return next(new ApiError("This user is not your friend", 400));
  }

  // 3) Find chat
  const chat = await Message
    .findOne({
      users: { $all: [req.user._id, friendId] }
    })
    .populate("users");

  return res.status(200).json({
    status: "success",
    data: chat || []   
  });
});

// send massage 

  export const sendmassagemassage = asyncHandler(async (req, res, next) => {
 
 const {friendId} = req.params ;
    const friends = await User.findById (friendId ) ;
    if (!friends) {
        return next (new ApiError ("no friend with this id " , 404 ) ) ;
    } ; 
    let chat = await Message.findOne ( {
        users : { $all : [req.user._id , friendId ] } 
    } )  ; 
    if (!chat ){
        chat = await Message.create ( {
            users : [req.user._id , friendId ] ,
            massages : [ {sender : req.user._id , content : req.body.content } ]
        } ) ;
    } else {
        chat.massages.push ( {sender : req.user._id , content : req.body.content } ) ;
        await chat.save () ;
    }
     


  // 4) SOCKET real-time message
  const receiverSocketId = getReceiverSocketId(friendId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", {
      sender: req.user._id,
      content: req.body.content,
      chatId: chat._id
    });
  }

   
  return res.status(200).json({
    status: "success" ,
    data: chat
  });
});


// friend request un accepted 
export const declineFriendRequest = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;
  const myId = req.user._id.toString();

  const user = await User.findById(friendId);
  if (!user) return next(new ApiError("No user with this id", 404));

  const me = await User.findById(myId);

 
  if (!me.friendRequests.includes(friendId)) {
    return next(new ApiError("No friend request from this user", 400));
  }
 
  await User.findByIdAndUpdate(myId, {
    $pull: { friendRequests: friendId }
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { sentRequests: myId }
  });

  return res.status(200).json({
    status: "success",
    message: "Friend request declined"
  });
});


// cancel sent friend request

export const cancelFriendRequest = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;
  const myId = req.user._id.toString();

  const user = await User.findById(friendId);
  if (!user) return next(new ApiError("No user with this id", 404));

  const me = await User.findById(myId);


  if (!me.sentRequests.includes(friendId)) {
    return next(new ApiError("No sent friend request to cancel", 400));
  }


  await User.findByIdAndUpdate(myId, {
    $pull: { sentRequests: friendId }
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { friendRequests: myId }
  });

  return res.status(200).json({
    status: "success",
    message: "Friend request canceled"
  });
});


export const removeFriend = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;
  const myId = req.user._id.toString();

  const user = await User.findById(friendId);
  if (!user) return next(new ApiError("No user with this id", 404));

  const me = await User.findById(myId);

  if (!me.friends.includes(friendId)) {
    return next(new ApiError("This user is not your friend", 400));
  }

 
  await User.findByIdAndUpdate(myId, {
    $pull: { friends: friendId }
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { friends: myId }
  });

  return res.status(200).json({
    status: "success",
    message: "Friend removed"
  });
});



export const getMyFriendRequests = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;

  const me = await User.findById(myId)
    .select("friendRequests")
    .populate("friendRequests", "name   email  profilePic ");

  if (!me) return next(new ApiError("User not found", 404));

  return res.status(200).json({
    status: "success",
    requests: me.friendRequests
  });
});

export const getMyFriends = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;

  const me = await User.findById(myId)
    .select("friends")
    .populate("friends", "name   email  profilePic ");

  if (!me) return next(new ApiError("User not found", 404));

  return res.status(200).json({
    status: "success",
    friends: me.friends
  });
});

// last massage from each friends 
 // last message from each friend OR show friend even if no messages yet
export const inbox = asyncHandler(async (req, res, next) => {
  const myId = req.user._id.toString();

  const me = await User.findById(myId)
    .select("friends")
    .populate("friends", "name username email profilePic");

  if (!me) return next(new ApiError("User not found", 404));

  const friends = me.friends;

  // loop on all friends
  const chats = await Promise.all(
    friends.map(async (friend) => {
      const friendId = friend._id.toString();

      const chat = await Message
        .findOne({ users: { $all: [myId, friendId] } })
        .select("massages users updatedAt")
        .lean();

      if (!chat) {
        return {
          friendId,
          lastMessage: null,        // no messages yet
          friend                   // basic friend info
        };
      }

      const lastMsg = chat.massages[chat.massages.length - 1];

      return {
        friendId,
        lastMessage: lastMsg,
        friend
      };
    })
  );

  // sort friends by last message time (friends without messages at the end)
  const sorted = chats.sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;

    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });

  return res.status(200).json({
    status: "success",
    inbox: sorted
  });
});


/// edit massage 
export const editMessage = asyncHandler(async (req, res, next) => {
  const { messageId, chatId } = req.params;
  const { content } = req.body;

  const chat = await Message.findById(chatId);
  if (!chat) return next(new ApiError("Chat not found", 404));

  const msg = chat.massages.id(messageId);
  if (!msg) return next(new ApiError("Message not found", 404));

  if (msg.sender.toString() !== req.user._id.toString()) {
    return next(new ApiError("You can edit your own messages only", 403));
  }

  msg.content = content;
  await chat.save();

 
// socket real-time edit message
chat.massages.id(messageId).content = content;
await chat.save();

chat.users.forEach(u => {
  if (u.toString() !== req.user._id.toString()) {
    const socketId = getReceiverSocketId(u.toString());
    if (socketId) {
      io.to(socketId).emit("messageEdited", {
        chatId,
        messageId,
        content,
      });
    }
  }
});

  return res.status(200).json({
    status: "success",
    message: msg
  });


});


// delete massage
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId, chatId } = req.params;

  const chat = await Message.findById(chatId);
  if (!chat) return next(new ApiError("Chat not found", 404));  
  const msg = chat.massages.id(messageId);
  if (!msg) return next(new ApiError("Message not found", 404));

  if (msg.sender.toString() !== req.user._id.toString()) {
    return next(new ApiError("You can delete your own messages only", 403));
  }

  msg.remove();
  await chat.save();
  // socket real-time delete message
 
chat.users.forEach(u => {
  if (u.toString() !== req.user._id.toString()) {
    const socketId = getReceiverSocketId(u.toString());
    if (socketId) {
      io.to(socketId).emit("messageDeleted", {
        chatId,
        messageId,
      });
    }
  }
});


  return res.status(200).json({
    status: "success",
    message: "Message deleted successfully"
  });
});

// mark seeeen

export const markAsSeen = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const myId = req.user._id;

  const chat = await Message.findById(chatId);
  if (!chat) return next(new ApiError("Chat not found", 404));

  chat.massages.forEach(msg => {
    if (!msg.readBy.includes(myId)) {
      msg.readBy.push(myId);
    }
  });

  await chat.save();

   
  chat.users.forEach(user => {
    if (user.toString() !== myId.toString()) {
      const socketId = getReceiverSocketId(user.toString());
      if (socketId) io.to(socketId).emit("messagesSeen", {
        chatId,
        seenBy: myId
      });
    }
  });

  res.status(200).json({ success: true });
});
 

 export const search = asyncHandler(async (req, res) => {
  try {
    const { query } = req.params;  
    if (!query || query.trim() === "") {
      return res.json({ data: [] });
    }

    console.log("Searching for:", query); 

    let users = [];
 
    if (mongoose.Types.ObjectId.isValid(query)) {
      users = await User.find({ _id: query }).select("_id fullName email profilePic");
      console.log("ID search results:", users);
    } 
    
 
    else {
      users = await User.find({
        email: { $regex: `^${query}$`, $options: "i" }
      }).select("_id   name   email profilePic");
      console.log("Email search results:", users);
    }

    
    if (users.length === 0) {
      users = await User.find({
        $or: [
          { email: { $regex: query, $options: "i" } },
          
        ]
      }).select("_id  name email profilePic");
      console.log("Partial search results:", users);
    }

    res.json({ data: users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

