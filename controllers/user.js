const  asyncHandler = require('express-async-handler')

const User =require('../models/user')
const {generateAccessToken ,generateReFreshToken} = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')

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
        const {password , role , ...userData} = response.toObject()
        //Obj.toObject() cover plain Object => Object base => Use Destructuring and Rest
        
        
        const accessToken = generateAccessToken(response._id , role);
        const refreshToken = generateReFreshToken(response._id);
        //Save RefreshToken into DB
        await User.findByIdAndUpdate(response._id ,{refreshToken: refreshToken} , {new: true});
        //Save refreshToken into Cookie
        res.cookie('refreshToken',refreshToken , {httpOnly:true , maxAge: 24*60*60*1000})

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

//Get Current User
const getCurrentUser = asyncHandler(async(req , res) =>{
    const { _id } = req.user;

    const user = await User.findById({_id : _id }).select('-refreshToken -password -role');
    return res.status(200).json({
        success : true,
        res : user? user : 'User not found!'
    })
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


module.exports = {
    register,
    login,
    getCurrentUser,
    refreshAccessToken,
    logout
}
