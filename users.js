const mongoose = require('mongoose')

const User = mongoose.model('User', {
    email: {type: String, required: true},
    password: {type: String.apply, required: true},
    salt: {type: String, required: true},
})

module.exports = Users