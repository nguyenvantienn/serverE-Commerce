const  asyncHandler = require('express-async-handler')

const User =require('../models/user')
const {generateAccessToken ,generateReFreshToken} = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const {sendMail} = require('../ultils/sendMail')
const crypto = require('crypto')
// const user = require('../models/user')

const register = asyncHandler(async(req , res) =>{
    const {email, password , firstname , lastname} = req.body;

    if (!email || !password || !lastname || !firstname){
        return res.status(400).json({
            sucess: false,
            mess : 'Missing input'
        })
    }
    const user = await User.findOne({email : email });
    if (user) {
        throw new Error('User has exist!')
    }else{
        const newUser = await User.create(req.body);
        return res.status(200).json({
            success : newUser? true : false,
            mes : newUser ? 'Register is successsfully. Please go Login....' : 'Something went wrong!'
        })

    }
})

const login = asyncHandler(async(req , res) =>{
    const {email, password} = req.body;

    if (!email || !password){
        return res.status(400).json({
            success: false,
            mess : 'Missing input'
        })
    }
    const response = await User.findOne({email : email});
    // console.log(response);
    if (response && await response.isCheckCorrectPassword(password)) {
        const {password , role , refreshToken ,  ...userData} = response.toObject()
        //Obj.toObject() cover plain Object => Object base => Use Destructuring and Rest
        
        
        const accessToken = generateAccessToken(response._id , role);
        const newRefreshToken = generateReFreshToken(response._id);
        //Save RefreshToken into DB
        await User.findByIdAndUpdate(response._id ,{refreshToken: newRefreshToken} , {new: true});
        //Save refreshToken into Cookie
        res.cookie('refreshToken',newRefreshToken , {httpOnly:true , maxAge: 24*60*60*1000})

        return res.status(200).json({
            success : true,
            accessToken : accessToken,
            userData : userData
        })
    }else{
        throw new Error('Invalid credentials . Email or Password is wrong. Please login again!')
        // return res.status(400).json({
        //     success: false,
        //     mess : 'Email or Password is wrong. Please login again!'
        // })
    }
})



const refreshAccessToken = asyncHandler(async(req , res) => {
    //  Get token from cookies
    const cookie = req.cookies
    
    if(!cookie && !cookie.refreshToken){
        throw new Error('No refresh token in cookies')
    }

    //Check token co hop le khong?
    const rs = await jwt.verify(cookie.refreshToken , process.env.JWT_SECRET);
    const response = await User.findOne({_id : rs._id , refreshToken : cookie.refreshToken})
        
    return res.status(200).json({
        success : response ? true : false,
        newAccessToken : response ? generateAccessToken(response._id , response.role) : 'Refresh token not matched'
    })

})


const logout = asyncHandler(async(req , res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken) {
        throw new Error('No refresh token in cookies')
    }
    // Xoa refreshToken tai DB
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken} , {refreshToken:''} , {new: true})
    // Xoa refresh Token o cookie tren trinh duyet
    res.clearCookie('refreshToken', {
        httpOnly: true , 
        secure : true
    })

    return res.status(200).json({
        success: true,
        mess: 'Logout is done'
    })

})

//Login reset Password
//client gui mail => Server check email co hop le hay khong 
//=> Gui mail + kem theo link(password change token)
// Gui thong bao cho client vào check mail dang ky => Click vào link server gửi đến
// =>Khi người dùng click vào link đó => Client gửi 1 api kèm theo token
//Server check token có đúng là token server gửi đi hay không => Đúng : Cho phép thay dổi password

const forgotPassword = asyncHandler(async (req , res) => {
    const {email} = req.query;
    if (!email) {
        throw new Error('Missing Email!')
    }
    const user = await User.findOne({email : email});
    if (!user) {
        throw new Error('User not found. Please check')
    }
    const resetToken = user.createPasswordChangedToken()
    await user.save();

    const html = `To change the your password, please click on the link.Note: The link will expire after 15 minutes. <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`


    const data = {
        email: email,
        html : html
    };

    const sendmailResetPassWord = await sendMail(data);
    return res.status(200).json({
        success : true,
        rs : sendmailResetPassWord
    })
})


const resetPassWord = asyncHandler(async (req , res) =>{
    const {token , password} = req.body;
    if (!token || !password) {
        throw new Error('Missing Input')
    }
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({passwordResetToken : passwordResetToken ,passwordResetExpires : {$gt : Date.now()}})
    if(!user){
        throw new Error('Invalid reset token( token has expired )')
    }

    //Setting new Password for User
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
        success : user? true : false,
        mess : user? 'Updated Password' : 'Something went wrong'
    })
})

//Get Current User
const getCurrentUser = asyncHandler(async(req , res) =>{
    const { _id } = req.user;

    const user = await User.findById({_id : _id }).select('-refreshToken -password -role');
    return res.status(200).json({
        success : user ? true : false,
        res : user? user : 'User not found!'
    })
})

const getAllUser = asyncHandler(async(req ,res) =>{
    const response = await User.find().select('-refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        user : response
    })
})

const deleteUser = asyncHandler(async(req ,res) =>{
    const {_id} = req.query
    if(!_id){
        throw new Error('Missing Input')
    }

    const response = await User.findByIdAndDelete(_id).select('-refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        mes : response ?`Delete Success User with email : ${response.email} name : ${response.firstname} ${response.lastname}` : 'Delete User failed. Dont find user to delete!!',
        user : response
    })
})

const updateUser = asyncHandler(async(req ,res) =>{
    const {_id} = req.query
    if(!_id || Object.keys(req.body).length ==0 ){
        throw new Error('Missing Input')
    }

    const response = await User.findByIdAndUpdate(_id,req.body ,{new:true}).select('-refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        mes : response ?`Update Success User with email : ${response.email} name : ${response.firstname} ${response.lastname}` : 'Update User failed. Something went wrong!!',
        user : response
    })
})

const updateUserByAdmin = asyncHandler(async(req ,res) =>{
    const { uid } = req.params
    if(Object.keys(req.body).length ==0 ){
        throw new Error('Missing Input')
    }

    const response = await User.findByIdAndUpdate(uid,req.body ,{new:true}).select('-refreshToken');
    return res.status(200).json({
        success: response ? true : false,
        mes : response ?`Update Success User with email : ${response.email} name : ${response.firstname} ${response.lastname}` : 'Update User failed. Something went wrong!!',
        user : response
    })
})

module.exports = {
    register,
    login,
    getCurrentUser,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassWord,
    getAllUser,
    deleteUser,
    updateUser,
    updateUserByAdmin
}
