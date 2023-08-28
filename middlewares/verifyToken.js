
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const verifyAccessToken = asyncHandler(async(req,res,next) => {
    if (req?.headers?.authorization?.startsWith('Bearer ')) {
        const token = req?.headers?.authorization.split(' ')[1];
        // console.log(token);
        //Check token co hop le khong
        jwt.verify(token ,process.env.JWT_SECRET , (err , decode) =>{
            if (err) {
                return res.status(401).json({
                    success : false,
                    mes : 'Invalid AccessToken!'
                })
            }
            //decode la cai minh bo vao de Hash ra accesstoken trong day la id va role
            console.log(decode);
            req.user = decode ;
            next();
        });
    }else{
        return res.status(401).json({
            success : false,
            mes : 'Require Authertication!'
        })
    }


})

module.exports ={
    verifyAccessToken
}