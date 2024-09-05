const  express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.post('/ajoutuser', userController.postUser)
router.get('/getVideastes', userController.getVideastes)
router.get('/getEntreprises', userController.getEntreprises)
router.get('/updateToAdmin', userController.updateToAdmin)

module.exports = router;
