const  express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.post('/ajoutuser', userController.postUser)

module.exports = router;
