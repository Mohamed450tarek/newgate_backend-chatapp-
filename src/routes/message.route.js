import express from "express";

import {
   getAllContacts,
  getchatmassage,
  sendmassagemassage,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getMyFriendRequests
  , getMyFriends,
  inbox,
  editMessage,
  deleteMessage,
  markAsSeen , 
  search
} from "../controllers/message.controller.js";
import {
  sendfrindrequest,
  acceptfrindrequest,
 } from "../controllers/auth.controller.js"; 
 
 import { protect } from "../controllers/auth.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// the middlewares execute in order - so requests get rate-limited first, then authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware.
router.use(arcjetProtection, protect );


router.post(
    '/friend-request/:friendId',
    protect,
    sendfrindrequest

);
router.post(
    '/friend-request/:friendId/accept',
    protect,
    acceptfrindrequest

);


router.get("/contacts",protect, getAllContacts );
 

//   Get the full chat between me & friend
router.get("/getchat/:friendId",   getchatmassage);

//   Send message to a friend
router.post("/sendchat/:friendId", protect, sendmassagemassage);

router.post("/friend-request/:friendId/decline", protect, declineFriendRequest);

router.post("/friend-request/:friendId/cancel", protect, cancelFriendRequest);

router.delete("/removefriend/:friendId", protect, removeFriend);

router.get("/getall-friend-requests", protect, getMyFriendRequests);

router.get("/return-allfriends", protect, getMyFriends);
// last massage from each friends 
router.get("/inbox", protect, inbox);
// edit massage 
router.put("/edit-message/:chatId/:messageId/edit", protect, editMessage);

router.delete("/delete-message/:chatId/:messageId", protect, deleteMessage);

router.post("/mark-as-seen/:chatId", protect, markAsSeen);

router.get("/search/:query", protect, search);
export default router;
 