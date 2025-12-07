const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

// login user
const loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, errorMessage: "Please enter all required fields." });
        }

        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res.status(401).json({ success: false, errorMessage: "Wrong email provided." })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            return res.status(401).json({ success: false, errorMessage: "Wrong password provided." })
        }
        console.log("passward correct")

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id);
        console.log(token);

        console.log("cookie")
        return  res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
            maxAge: 24 * 60 * 60 * 1000 
        }).status(200).json({
            success: true,
            user: {
                id: existingUser._id,
                username: existingUser.username, 
                email: existingUser.email              
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

// signup
const registerUser = async (req, res) => {
    console.log("registering user")
    try{
        console.log(req.body)
        const { username, email, avatar, password, passwordConfirm } = req.body;
        if (!username || !email || !avatar || !password || !passwordConfirm) {
            console.log("faild: missing fields")
            console.log(`username: ${username}, email: ${email}, avatar: ${avatar}, password: ${password}, passwordC: ${passwordConfirm}`)
            return res.status(400).json({ success: false, errorMessage: "Please enter all required fields." });
        }
        if (password.length < 8) {
            console.log("faild: pass length")
            return res.status(400).json({ success: false, errorMessage: "Please enter a password of at least 8 characters."});
        }
        if (password !== passwordConfirm) {
            console.log("faild: pass not equ")
            return res.status(400).json({ success: false, errorMessage: "Please enter the same password twice."})
        }
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            console.log("faild: email already exit")
            return res.status(400).json({ success: false, errorMessage: "An account with this email address already exists."})
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const userData = {
            username,
            email,
            avatar,
            passwordHash,
            playlists: []
        };
        const savedUser = await User.create(userData);
        // return res.status(200).json({
        //     success: true,
        //     user: {
        //         username: savedUser.username,
        //         email: savedUser.email              
        //     }
        // })
        const token = auth.signToken(savedUser.id);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
            maxAge: 24 * 60 * 60 * 1000 
        }).status(200).json({
            success: true,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email              
            }
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

const logoutUser = async (req, res) => {
    console.log("logout")
    return res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }).status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

const getLoggedIn = async (req, res) => {
    console("getLoggedIn")
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }
        console.log("find user: " + userId);
        const loggedInUser = await User.findOne({ _id: userId });
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                username: loggedInUser.username,
                email: loggedInUser.email
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

module.exports = { loginUser, registerUser, logoutUser, getLoggedIn}