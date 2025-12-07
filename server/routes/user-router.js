const express = require('express')
const UserController = require('../controllers/user-controller')
const router = express.Router()

router.get('/:id', UserController.getUserById)
router.get('/by-email/:email', UserController.getUserByEmail);

module.exports = router