const express = require("express");
const router = express.Router();
const StoresController = require("../../controllers/stores.controller");
const { verifyToken } = require("../../middlewares/token");

// Store Merchant details
router.get("/info", verifyToken, StoresController.getStoreDetails);
router.get("/search",verifyToken, StoresController.getStoreSearchDetails);
router.get("/services",verifyToken, StoresController.getStorePopularServices);
router.get("/suggested-services",verifyToken, StoresController.getSuggestedServices);
router.get("/all", verifyToken, StoresController.getAllStoreDetails);
router.get("/home",verifyToken, StoresController.getHomeStoreDetails);
router.post("/register-store",verifyToken, StoresController.registerStoreDetails);
router.put("/update",StoresController.updateStoreDetails);

//Rating Routes
router.post("/rate", verifyToken, StoresController.rateStore)

module.exports = router;
