
const router = require('express').Router();
const ctrls = require('../controllers/product');
const {verifyAccessToken , checkIsAdmin} = require('../middlewares/verifyToken')

router.post('/createproduct' , [verifyAccessToken , checkIsAdmin] , ctrls.createProduct)
router.get('/' , ctrls.getAllProduct) 

router.delete('/deleteproduct/:pid' , [verifyAccessToken , checkIsAdmin] , ctrls.deleteProduct)
router.put('/updateproduct/:pid' , [verifyAccessToken , checkIsAdmin] , ctrls.updateProduct)
router.get('/:pid' , ctrls.getDetailProduct)

module.exports = router;