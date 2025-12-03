// String     (_id)=>_id.toString()
/*
exports.arefriends = function  (user, friend ) {
    //user frind in mongoo 
    // frinnds 
    //if (friend.friends .includes(user._id)) // error return two opject id can not combere
    if (friend.friends.map((_id)=>_id.toString()).includes(user._id)
         ||  user.friends.map((_id)=>_id.toString()).includes(friend._id))  // return array from two string 
  return true ; 

  return false ;   
}  ; 
exports.requestExist = function  (user, friend ) {
    //user frind in mongoo 
    // frinnds 
    //if (friend.friends .includes(user._id)) // error return two opject id can not combere
    if (friend.frindesreq.map((_id)=>_id.toString()).includes(user._id)
         ||  user.friendsreq.map((_id)=>_id.toString()).includes(friend._id))  // return array from two string 
  return true ; 

  return false ;   
} */
 
 export const arefriends = function (user, friend) {
  const userFriends = user?.friends || [];
  const friendFriends = friend?.friends || [];

  const userId = user?._id?.toString();
  const friendId = friend?._id?.toString();

 
  if (
    friendFriends.map((_id) => _id.toString()).includes(userId) ||
    userFriends.map((_id) => _id.toString()).includes(friendId)
  ) {
    return true;
  }

  return false;
};

 export const requestExist = function (user, friend) {
 
  const friendRequests = friend?.friendrequest || [];
  const userRequests = user?.friendrequest || [];

  const userId = user?._id?.toString();
  const friendId = friend?._id?.toString();

  if (
    friendRequests.map((_id) => _id.toString()).includes(userId) ||
    userRequests.map((_id) => _id.toString()).includes(friendId)
  ) {
    return true;
  }

  return false;
};
