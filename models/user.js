

//Declare the schema of the Mongo model

const mongoose  = require("mongoose");
const bcrypt = require("bcrypt");


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
    }
}


// Export User Model 
module.exports =  mongoose.model('User' , userSchema);