import express from "express";
import {
    signup,
    login,
    forgotPassword,
    verifyPassResetCode,
    resetPassword,
   // googleLogin,
      profilePicture,
    protect
} from "../controllers/auth.controller.js";
 
import { uploadCloud } from "../lib/multercloudnary.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
 
const router = express.Router();

router.use(arcjetProtection);
 
router.post("/signup", signup);
router.post("/login", login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', resetPassword);
//router.put('/googlelogin',  googleLogin);
 


router.put(
  "/update-profile",
  protect,
  uploadCloud().single("image") , profilePicture 
  

);
//router.put("/update-profile", protect,  profilePicture);

router.get("/check",  protect , (req, res) => res.status(200).json(req.user));

export default router;
 