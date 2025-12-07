const User = require('../models/user-model')

const getUserById = async (req, res) => {
    // Get user by ID
    const user = await User.findById(req.params.id)
        .select('-passwordHash'); // Exclude sensitive fields
    res.json({ success: true, user });
}

const getUserByEmail = async (req, res) => {
    // Get user by email
    try{
        const user = await User.findOne({ email: req.params.email })
            .select('username email avatar');
        res.json({ success: true, user });
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

module.exports={
    getUserById,
    getUserByEmail,
}