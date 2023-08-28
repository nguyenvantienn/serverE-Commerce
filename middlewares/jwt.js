const jwt = require('jsonwebtoken')


//Ham create AccessToken
const generateAccessToken = (uid , role) =>{
    return jwt.sign({_id: uid , role : role} , process.env.JWT_SECRET , {expiresIn:'3d'})
} 

//Ham create RefreshToken
const generateReFreshToken = (uid) =>{
    return jwt.sign({_id: uid } , process.env.JWT_SECRET , {expiresIn:'7d'})
} 



//Ham check token


module.exports = {
    generateAccessToken,
    generateReFreshToken

}