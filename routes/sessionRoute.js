const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/session/connection', sessionController.sessionStart)
router.get('/session/logout', sessionController.sessionLogout)
router.get('/session/getSession', sessionController.getSession)

module.exports = router;