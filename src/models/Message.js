import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;
 
const massageSchema = new  Schema({
  sender : { type : Types.ObjectId , ref : "Userchat" , required : true  } ,
   content  : { type :String , required : true } ,
  readBy : [{ type : Types.ObjectId , ref : "Userchat"  } ]
} , { timestamps : true } ) ;


const chatscema = new Schema({
users :{ type :[{ type : Types.ObjectId , ref : "Userchat" , required : true  } ],
validate :{validator : (v) => v.length  == 2 ,
message : "chat must be between two users only "}}, //two users
massages : [massageSchema] 

}

,{timestamps : true } )   ; 

const Message = mongoose.model("Message",  chatscema )  ;

export default Message;
