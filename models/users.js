const { required } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;



const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema=new Schema({


    email:{

        type: String,
        required:true,
    }
})
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);