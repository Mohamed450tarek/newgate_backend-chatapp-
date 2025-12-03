const groupMessageSchema = new Schema({
  sender: { type: Types.ObjectId, ref: "Userchat", required: true },
  content: { type: String },
  media: { url: String, type: String },
  readBy: [{ type: Types.ObjectId, ref: "Userchat" }]
}, { timestamps: true });

const groupChatSchema = new Schema({
  isGroup: { type: Boolean, default: true },
  groupName: { type: String, required: true },
  groupAvatar: { type: String },
  admins: [{ type: Types.ObjectId, ref: "Userchat" }],
  users: [{ type: Types.ObjectId, ref: "Userchat", required: true }],
  messages: [groupMessageSchema]
}, { timestamps: true });

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

export default GroupChat;