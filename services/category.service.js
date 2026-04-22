const Category = require("../models/category.model");


const createCategory = async (id, name, parent_id) => {
    try {
      const category = new Category({
        id,
        name,
        parent_id,
      });
      return await category.save();
    } catch (error) {
      return null;
    }
}

const getAllCategoryAndSubCategory = async () => {
  try {
    return await Category.find({})
      .select('-createdAt -updatedAt') // __v is already removed via schema
      .sort({ id: 1 })
      .lean();
  } catch (error) {
    return null;
  }
};


const getCategory = async () => {
  try {
    return await Category.find({ parent_id: -1 })
      .select('-__v -createdAt -updatedAt') // exclude extra fields
      .sort({ id: 1 })
      .lean();
  } catch (error) {
    return null;
  }
};

const getTopFiveCategory = async () => {
  try {
    return await Category.find({ parent_id: -1 })
      .select('-__v -createdAt -updatedAt') // exclude extra fields
      .sort({ id: 1 })
      .limit(5);
  } catch (error) {
    return null;
  }
};

const getTopFiveCategoryWithSubcategories = async () => {
  try {
    const categories = await Category.aggregate([
      {
        $match: { parent_id: -1 }
      },
      {
        $sort: { id: 1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "categories",          // collection name
          localField: "id",            // parent id
          foreignField: "parent_id",   // child reference
          as: "subcategories"
        }
      },
      {
        $project: {
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          "subcategories.__v": 0,
          "subcategories.createdAt": 0,
          "subcategories.updatedAt": 0
        }
      },
      {
        $addFields: {
          subcategories: { $slice: ["$subcategories", 3] } // only 3 subcategories
        }
      }
    ]);

    return categories;
  } catch (error) {
    console.error(error);
    return null;
  }
};


const getSubCategory = async (id) => {
  try {
    return await Category.find({ parent_id: id })
      .select('-__v -createdAt -updatedAt')
      .sort({ id: 1 }) // exclude extra fields
      .lean();
  } catch (error) {
    return null;
  }
};

  

module.exports = {
    createCategory : createCategory,
    getCategory : getCategory,
    getTopFiveCategory: getTopFiveCategory,
    getSubCategory: getSubCategory,
    getAllCategoryAndSubCategory : getAllCategoryAndSubCategory,
    getTopFiveCategoryWithSubcategories: getTopFiveCategoryWithSubcategories
}