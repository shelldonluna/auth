const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const {expressjwt: jwt} = require('express-jwt')
const User = require('./user')

mongoose.connect('mongodb+srv://shelldon:sh311d0n@cluster0.y8jgm49.mongodb.net/auth?retryWrites=true&w=majority')
//se crea la app con express para utilizar la api hacia mongo
const app = express()
app.use(express.json())

console.log(process.env.SECRET)
const validateJwt = jwt({ secret: process.env.SECRET, algorithms: ['HS256']})
// esta es la funcion que firma el  jsonwebtoken, la cual se utiliza 
//para firmar el id y que lo muestre encriptado
const signToken = _id => jsonwebtoken.sign({ _id }, process.env.SECRET)
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
        if(!user) {
            res.status(403).send('usuario   invalida')
        }else {
            const isMatch = await bcrypt.compare(body.password, user.password)
            if (isMatch) {
                const signed = signToken(user._id)
                res.status(200).send(signed)
            }else {
                res.status(403).send('contrasenia invalida')
            }
        }
    } catch(err) {
        res.status(500).send(err.message)
    }
})

//Middleware de authorization 
const findAndAssignUser = async (req,res,next) => {
    try {
        const user = await User.findById(req.auth._id)
        if (!user) {
            return res.status(401).end()
        }
        req.auth = user
        next()
    } catch (e) {
        next(e)
    }
}

const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser)
app.get('/lele',isAuthenticated, (req, res) =>{
    //res.send(req.auth)
    throw new Error('nuevo error')
})
app.use((err,req,res,next) => {
    console.error('Mi nuevo error :(', err.stack)
    next(err)
})
app.use ((err,req,res, next) => {
    res.send('Ha ocurrido un error :(')
})



app.listen(3000, () => {
    console.log ('Listening por 3000')
})