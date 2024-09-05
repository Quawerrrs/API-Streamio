const  express = require('express');
const router = express.Router();
const chainesController = require('../controllers/chainesController.js');

router.post('/addchannel', chainesController.addChannel)
router.post('/getchannels', chainesController.getChannels)
router.post('/getchannelsid', chainesController.getChannelsID)

module.exports = router;