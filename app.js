const ex = require("express")
const morgan = require("morgan")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")

dotenv.config()

const app = ex()

app.use(morgan("combined"))

const auth = (req, res, next) => {
    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1]
        try {
            validate = jwt.verify(token, process.env.SECRET)

            if (validate.token_type == "access_token") {
                req.payload = validate
                next()
            }
            res.json({
                eror: "invalid token type",
            })
        } catch (e) {
            res.json(e)
        }
    } else {
        res.json({
            error: "token is missing",
        })
    }
}

const gentoken = () => {
    ret = {
        access_token: jwt.sign(
            { token_type: "access_token" },
            process.env.SECRET,
            {
                expiresIn: 60 * 1,
            }
        ), // 1 minutes

        refresh_token: jwt.sign(
            { token_type: "refresh_token" },
            process.env.SECRET,
            { expiresIn: 60 * 3 }
        ), // 3 minutes
    }
    return ret
}

app.get("/", (req, res) => {
    res.json({
        generate_token: "GET /gentoken",
        check_token: "GET /check?token=xxxx",
        refresh_token: "GET /refresh?token=xxxx, renew token by refresh token",
        protect: "/protect, headers: authorization Bearer xxxxx",
        access_token_timeout: "1 minutes",
        refresh_token_timeout: "3 minutes",
    })
})

app.get("/gentoken", (req, res) => {
    res.json(gentoken())
})

app.get("/check", (req, res) => {
    if (req.query.token) {
        try {
            validate = jwt.verify(req.query.token, process.env.SECRET)
            res.json(validate)
        } catch (e) {
            res.json(e)
        }
    }

    res.json({
        error: "token is missing",
    })
})

app.get("/refresh", (req, res) => {
    if (req.query.token) {
        try {
            validate = jwt.verify(req.query.token, process.env.SECRET)

            if (validate.token_type == "refresh_token") {
                res.json(gentoken())
            }

            res.json({
                error: "invalid token type",
            })
        } catch (e) {
            res.json(e)
        }
    }

    res.json({
        error: "token is missing",
    })
})

app.get("/protect", auth, (req, res) => {
    res.json({
        message: "this protect endpoint",
        payload: req.payload,
    })
})

app.listen(process.env.PORT)
