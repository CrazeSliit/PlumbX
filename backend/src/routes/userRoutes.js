const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Routes

// Get all users
router.get('/', userController.getUsers);

// Get single user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user by ID
router.put('/:id', userController.updateUser);

// Delete user by ID
router.delete('/:id', userController.deleteUser);

// Login (original simple login)
router.post('/login', userController.login);

// Register (original registration)
router.post('/register', userController.registerUser);

// Login (with employee table check)
router.post('/loginUser', userController.loginUser);

// Get user profile by ID
router.get('/profile/:id', userController.getUserProfile);

// Update user profile by ID
router.put('/profile/:id', userController.updateUserProfile);

// Delete user account by ID
router.delete('/profile/:id', userController.deleteUserAccount);

module.exports = router;
