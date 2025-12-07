const jwt = require("jsonwebtoken")

const authManager = () => {
    const auth = {};
    
    auth.verify = (req, res, next) => {
        // ... verify logic
        try{
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    user: null,
                    errorMessage: "Unauthorized Request"
                })
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET)
            console.log("verified.userId: " + verified.userId);
            req.userId = verified.userId;

            next();
        }
        catch (err) {
            console.error(err);
            return res.status(401).json({
                user: null,
                errorMessage: "Unauthorized Request"
            })
        }
    };
    
    auth.verifyUser = (req) => {
        // ... silent verification
        try {
            const token = req.cookies.token;
            if (!token) {
                return null;
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            return decodedToken.userId;
        } 
        catch (err) {
            return null;
        }
    };
    
    auth.signToken = (userId) => {
        return jwt.sign({
            userId: userId
        }, process.env.JWT_SECRET);
    }
    
    return auth;
};

const auth = authManager();
module.exports = auth;