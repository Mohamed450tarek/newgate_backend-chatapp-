 const joi = require("joi");

 // Schema for validating chat retrieval
const getChatSchema = joi.object({
  friendId: joi.string().required()
}).required();

// valdition for sending schema 
const sendMessageSchema = joi.object({
  friendId: joi.string().required(),
  content: joi.string().required()
}).required();

 // validation on get chat 
 export const validateGetChat = (req, res, next) => {
  const { error } = getChatSchema.validate(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
 // validation on send massage 
 export const  validateSendMessage = (req, res, next) => {
  const data = { friendId: req.params.friendId, ...req.body };
  const { error } = sendMessageSchema.validate(data);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
