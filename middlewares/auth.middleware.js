const jwt = require('jsonwebtoken')
const redis_client = require('../redis_connect')

const verifyToken = (req, res, next) => {
    try {

        // Bearer token_string
        const token = req.headers.authorization.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.userData = decoded
        req.token = token

        // Verify BlackList access token
        redis_client.get('BL_' + decoded.sub.toString(), (err, data) => {
            if (err) throw err

            if (data === token) return res.status(401).json({ status: false, message: "Black listed token." })
            next()
        })
    } catch (error) {
        return res.status(401).json({ status: false, message: "Your session is not valid.", data: error })
    }
}

const verifyRefreshToken = (req, res, next) => {

    const refreshToken = req.body.token

    if (refreshToken === null) return res.status(401).json({
        status: false,
        message: "Invalid request."
    })

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        req.userData = decoded

        // verify if token is in store or not
        redis_client.get(decoded.sub.toString(), (err, data) => {
            if (err) throw err

            if (data === null) return res.status(401).json({
                status: false,
                message: "Invalid request. Token is not in store."
            })

            if (JSON.parse(data).token !== refreshToken) return res.status(401).json({
                status: false,
                message: "Invalid request. Token is not same in store."
            })

            next()
        })
    } catch (error) {
        return res.status(401).json({ status: false, message: "Your session is not valid.", data: error })
    }
}

module.exports = {
    verifyToken,
    verifyRefreshToken
}