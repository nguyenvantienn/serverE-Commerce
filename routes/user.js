
const router = require('express').Router();
const ctrls = require('../controllers/user');
const {verifyAccessToken} = require('../middlewares/verifyToken')


router.post('/register' , ctrls.register)
router.post('/login' , ctrls.login)
router.get('/getcurentUser', verifyAccessToken ,ctrls.getCurrentUser)
router.post('/refreshtoken' , ctrls.refreshAccessToken)
router.get('/logout' ,ctrls.logout)


module.exports = router;

//CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE