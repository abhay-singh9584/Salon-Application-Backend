const CategoryService = require("../services/category.service");
const sendResponse = require("../utils/responseUtil");

const registerCategory = async (req, res) => {
  try {
    const { id, name, parent_id } = req.body;
    if (!id || !name || !parent_id) {
      return sendResponse(res, 400, "FAILED", "Missing required field");
    }

    const result = await CategoryService.createCategory(id, name, parent_id);
    if (result && parent_id == -1) {
      return sendResponse(res,200,"SUCCESS","Category created successfully");
    } else if (result && parent_id !== -1) {
      return sendResponse(res,200,"SUCCESS","Sub category created successfully!")
    }

    return sendResponse(res, 400, "FAILED", "Failed to create Category or Sub category");
  } catch (error) {
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const fetchAllCategoryAndSubCategory = async (req, res) => {
  try {
    const all = await CategoryService.getAllCategoryAndSubCategory();

    const parentCategories = all.filter((cat) => cat.parent_id === -1);
    const subCategories = all.filter((cat) => cat.parent_id !== -1);

    const result = parentCategories.map((parent) => {
      const sub = subCategories
        .filter((sub) => sub.parent_id === parent.id)
        .map(({ id, name }) => ({ id, name }));

      return {
        id: parent.id,
        name: parent.name,
        subCategory: sub,
      };
    });

    if (result) {
      return sendResponse(res, 200, "SUCCESS", "Category and sub category fetched successfully", { result });
    }
    return sendResponse(res, 400, "FAILED", "Failed to fetch category");
  } catch (error) {
    sendResponse(res, 500, "FAILED", error.message);
  }
};

const fetchCategory = async (req, res) => {
  try {
    const result = await CategoryService.getCategory();
    if (result) {
      return sendResponse(res, 200, "SUCCESS", "Category fetched successfully", { result });
    }
    return sendResponse(res, 400, "FAILED", "Failed to fetch category");
  } catch (error) {
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const fetchSubCategory = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await CategoryService.getSubCategory(id);
    if (result) {
      return sendResponse(res, 200, "SUCCESS", "Sub Category fetched successfully", { result });
    }
    return sendResponse(res, 400, "FAILED", "Failed to fetch sub categry");
  } catch (error) {
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

module.exports = {
  registerCategory: registerCategory,
  fetchCategory: fetchCategory,
  fetchSubCategory: fetchSubCategory,
  fetchAllCategoryAndSubCategory: fetchAllCategoryAndSubCategory,
};
