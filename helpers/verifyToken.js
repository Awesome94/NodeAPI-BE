const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    if(!req.headers['authorization']){
        return res.status(403).send({error: "Missing authorization in headers"})
    }

    const [, token] = req.headers['authorization'].split(' ');

    if (!token) return res.status(401).send({ error: "Access Denied, Missing token" });
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send({error: "Access Denied, Invalid token"});
    }
}