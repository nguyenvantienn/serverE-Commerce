
const router = require('express').Router();
const ctrls = require('../controllers/user');
const {verifyAccessToken , checkIsAdmin} = require('../middlewares/verifyToken')


router.post('/register' , ctrls.register)
router.post('/login' , ctrls.login)
router.get('/getcurentUser', verifyAccessToken ,ctrls.getCurrentUser)
router.post('/refreshtoken' , ctrls.refreshAccessToken)
router.get('/logout' ,ctrls.logout)
router.get('/forgotpassword' ,ctrls.forgotPassword)
router.put('/resetpassword' ,ctrls.resetPassWord)
router.put('/updatecurrentuser' ,verifyAccessToken ,ctrls.updateUser)
router.get('/getalluser' , [verifyAccessToken , checkIsAdmin] ,ctrls.getAllUser)
router.delete('/deleteuser' , [verifyAccessToken , checkIsAdmin] ,ctrls.deleteUser)
router.put('/updateuserbyadmin/:uid' , [verifyAccessToken , checkIsAdmin] ,ctrls.updateUserByAdmin)


module.exports = router;

//CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// Create (POSt) and PUT => gửi dữ liệu ở body
//GET + Delete => Gửi lên server theo kiểu query