const express = require('express');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');

// All Sauces
router.get('/', saucesCtrl.getAllSauces);

// Sauce by id
router.get('/:id', saucesCtrl.getSauceById);

// new Sauce
router.post('/', saucesCtrl.createSauce);

// update Sauce
router.post('/:id', saucesCtrl.updateSauce);

// delete Sauce
router.delete('/:id', saucesCtrl.deleteSauce);

// like dislike
router.post('/:id/like', saucesCtrl.evalSauce);

module.exports = router;
