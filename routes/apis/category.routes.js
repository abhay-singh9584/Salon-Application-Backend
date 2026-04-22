const express = require("express");
const router = express.Router();
const CategoryController = require("../../controllers/category.controller");

//register and fetch category and sub category
router.post("/register", CategoryController.registerCategory);
router.get("/all", CategoryController.fetchAllCategoryAndSubCategory);
router.get("/categories", CategoryController.fetchCategory);
router.get("/sub-categories", CategoryController.fetchSubCategory);
module.exports = router;
