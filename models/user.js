

//Declare the schema of the Mongo model

const mongoose  = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


var userSchema = new mongoose.Schema({
    firstname : {
        type : String,
        require: true
    },
    lastname : {
        type : String,
        require: true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    mobile : {
        type : String,
        require: true,
        // unique : true
    },
    password : {
        type : String,
        require: true
    },
    role : {
        type : String,
        default : 'user'

    },
    cart : {
        type: Array,
        default  : []
    },
    address : [{type: mongoose.Types.ObjectId , ref: 'Address'}],
    wishlist : [{type : mongoose.Types.ObjectId , ref : 'Product'}],
    isBlocked : {
        type : Boolean,
        default : false
    },
    refreshToken : {
        type : String,
    },
    passwordChangedAt : {
        type : String,
    },
    passwordResetToken: {
        type : String
    },
    passwordResetExpires: {
        type : String
    }
} , {
    timestamps : true
})

//Hash Password before Create New User
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = bcrypt.genSaltSync(7);
    this.password = await bcrypt.hash(this.password , salt);
})

userSchema.methods = {
    isCheckCorrectPassword : async function(password) {
        return await bcrypt.compare(password , this.password);
    },
    createPasswordChangedToken : function() {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpires = Date.now() + 15*60*1000;

        return resetToken
 
    }
}


// Export User Model 
module.exports =  mongoose.model('User' , userSchema);