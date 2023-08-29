
const router = require('express').Router();
const ctrls = require('../controllers/user');
const {verifyAccessToken} = require('../middlewares/verifyToken')


router.post('/register' , ctrls.register)
router.post('/login' , ctrls.login)
router.get('/getcurentUser', verifyAccessToken ,ctrls.getCurrentUser)
router.post('/refreshtoken' , ctrls.refreshAccessToken)
router.get('/logout' ,ctrls.logout)
router.get('/forgotpassword' ,ctrls.forgotPassword)
router.put('/resetpassword' ,ctrls.resetPassWord)


module.exports = router;

//CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// Create (POSt) and PUT => gửi dữ liệu ở body
//GET + Delete => Gửi lên server theo kiểu query