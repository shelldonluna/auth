const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const User = require('./user')

mongoose.connect('mongodb+srv://shelldon:sh311d0n@cluster0.y8jgm49.mongodb.net/auth?retryWrites=true&w=majority')
//se crea la app con express para utilizar la api hacia mongo
const app = express()
app.use(express.json())

const signToken = _id => jwt.sign({ _id }, 'mi-string-secreto')
//se crea la función post la cual  utiliza un try catch en el caso
//que ya exista el usuario, manda un mensaje de errir 500 en caso de que falle
app.post('/register', async (req,res) => {
    const { body } = req
    console.log({ body })
    try {
        const isUser = await User.findOne({ email: body.email })
        if (isUser) {
            return res.status(403).send('Usuario ya existe')
        }
        //aqui se usa el salt y el hash para encriptar el password
        //el usuario va a ser el correo electronico
        const salt  = await bcrypt.genSalt()
        const hashed = await bcrypt.hash(body.password, salt)
        const user = await User.create ({email: body.email, password:hashed, salt})
        //aqui se encripta el id del usuario para que no venga en claro 
        const signed = signToken(user._id)

        res.status(201.).send(signed)

    } catch (err) {
        console.log(err) 
        res.status(500).send(err.message)
        
    }
})
//endpoint de inicio de sesion 
app.post('/login', async (req,res) => {
    const { body } = req
    try {
        const user = await User.findOne({ email: body.email })
    } else {
        const isMatch = await bcrypt.compare(body.password, user.password)
        if (isMatch) {
            const signed = signToken(user._id)
            res.status(200).send(signed)
        }else {
            res.status(403).send('Usuario y/o contrasenia invalida')
        }
    }
})
app.listen(3000, () => {
    console.log ('Listening por 3000')
})