var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController')

/**
 * Route to register a new user
 * POST /users/create
 */
router.post('/create', UserController.store);

/**
 * Route to authenticate a user
 * POST /users/login
 */
router.post('/login', AuthController.login);


module.exports = router;