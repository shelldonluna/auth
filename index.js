const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

mongoose.connect('mongodb+srv://shelldon:sh311d0n@cluster0.y8jgm49.mongodb.net/auth?retryWrites=true&w=majority')

const app = express()
app.use(express.json())