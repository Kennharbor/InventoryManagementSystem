const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// ! NO authentication required for these routes
router.post('/', userController.createUser);
router.post('/createUser', userController.createUser);
router.post('/login', userController.loginUser);

module.exports = router;
