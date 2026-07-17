//E/E-backend/routes/user.js
const express = require('express');
const router = express.Router();
const UserController = require('../controller/user');
const Authentication = require('../authentication/auth')

router.post('/register', UserController.register)
router.post('/login',UserController.login)
router.post('/google',UserController.loginThroughGmail)

router.put('/update',Authentication.auth,UserController.updateUser)
router.get('/user/:id',UserController.getProfileById)
router.post('/logout',Authentication.auth,UserController.logout)
router.delete('/delete-account', Authentication.auth, UserController.deleteAccount)

router.get('/self',Authentication.auth,(req,res)=>{
    return res.status(200).json({
        user:req.user
    })
})

router.get('/findUser',Authentication.auth,UserController.findUser)
router.post('/sendFriendReq',Authentication.auth,UserController.sendFriendRequest)
router.post('/acceptFriendRequest',Authentication.auth,UserController.acceptFriendRequest);
router.post('/ignoreFriendRequest',Authentication.auth,UserController.ignoreFriendRequest);
router.delete('/removeFromFriendList/:friendId',Authentication.auth,UserController.removeFromFriend)

router.get('/friendsList',Authentication.auth,UserController.getFriendsList)
router.get('/pendingFriendsList',Authentication.auth,UserController.getPendingFriendList)

module.exports = router;