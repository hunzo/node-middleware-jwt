const ex = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const app = ex()

app.use(morgan('combined'))

const auth = (req, res, next) => {
    if (req.headers.authorization) {
        let token = req.headers.authorization.split(' ')[1]

        try {
            let validate = jwt.verify(token, process.env.SECRET)
            req.payload = validate
            next()
        } catch (e) {
            res.json(e)
        }
    } else {
        res.json({
            error: 'token is missing',
        })
    }
}

app.get('/', (req, res) => {
    res.json({
        jwt: jwt.sign({ info: 'payload' }, process.env.SECRET, {
            expiresIn: 60 * 1,
        }),
    })
})

app.get('/protect', auth, (req, res) => {
    res.json({
        message: 'this protect endpoint',
        payload: req.payload,
    })
})

app.listen(process.env.PORT)
