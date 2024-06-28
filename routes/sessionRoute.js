const  express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/session/connection', sessionController.sessionStart)

module.exports = router;