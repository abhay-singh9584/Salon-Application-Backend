const express = require('express');
const router = express.Router();
const catalogController = require('../../controllers/catalog.controller');

router.post('/register', catalogController.registerCatalog);  //for first time registration
router.post("/add-service", catalogController.addServiceToCatalog); // to add new service to existing catalouge
router.get('/:store_id', catalogController.getCatalog);  // search using storeId or storeId and category_id
router.put('/update', catalogController.updateCatalog)

module.exports = router;
