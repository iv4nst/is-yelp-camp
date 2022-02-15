const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')    // used only in model (passport and passport-local are used in app)


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
    // no username and password (because of passport)
})

userSchema.plugin(passportLocalMongoose)    // this adds username (unique) and password, hash, salt, methods...to the schema

module.exports = mongoose.model('User', userSchema)