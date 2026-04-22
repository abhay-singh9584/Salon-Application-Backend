const Store = require("../models/stores.model");
const Merchant = require("../models/merchant.model");
const Category = require("../models/category.model");
const sendResponse = require("../utils/responseUtil");
const logger = require("../utils/logger");
const { getDistanceFromLatLonInKm } = require("../utils/utils");
const catalogModel = require("../models/catalog.model");
const categoryService = require("../services/category.service");
const storeService = require("../services/store.service");
const catalogService = require("../services/catalog.service");
const { jwt } = require("twilio");

require("dotenv").config();

//All Stores details
// Store Merchant details
const getAllStoreDetails = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 25;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const storeCount = await Store.countDocuments();
    const totalPages = Math.ceil(storeCount / limit);
    const hasNextPage = page < totalPages;

    const store = await Store.find({}).limit(limit).skip(skip);

    if (!store || store.length === 0) {
      return sendResponse(res, 400, "FAILED", "Store not found");
    }

    sendResponse(res, 200, "SUCCESS", "Store details fetched successfully", {
      data: store,
      totalPages: totalPages,
      nextPage: hasNextPage,
      storeCount: storeCount,
    });
  } catch (error) {
    console.error("Error retrieving store details:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};

// Store Merchant details
const getStoreDetails = async (req, res) => {
  try {
    const { store_id, lng, lat } = req.query;

    if (!store_id && (!lng || !lat)) {
      return sendResponse(
        res,
        400,
        "FAILED",
        "Please provide store_id and coordinates"
      );
    }
    // const longitude = parseFloat(lng);
    // const latitude = parseFloat(lat);

    const store = await Store.findOne({ store_id: store_id });
    const [longitude, latitude] = store.location.coordinates;
    const distance = getDistanceFromLatLonInKm(latitude, longitude, parseFloat(lat), parseFloat(lng));

    const catalog = await catalogService.getRecommendedCatalog(store_id);

    const topFiveCategories = await categoryService.getTopFiveCategory(); //TODO fetch categories of services from cataloge of store_id

    if (!store) {
      return sendResponse(res, 400, "FAILED", "Store not found");
    }

    sendResponse(res, 200, "SUCCESS", "Store details fetched successfully", {
      store,
      distance,
      top_five_categories : topFiveCategories,
      recommended_services : catalog.data?.services
    });
  } catch (error) {
    console.error("Error retrieving store details:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};

const getHomeStoreDetails = async (req, res) => {
  try {
    const { searchKey, lng, lat } = req.query;
    const limit = Number(req.query.limit) || 5;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (!searchKey && (!lng || !lat)) {
      return sendResponse(
        res,
        400,
        "FAILED",
        "Please provide a search keyword for storeName or address"
      );
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const maxAllowedDistance = 10; // in km

    if (isNaN(longitude) || isNaN(latitude)) {
      return sendResponse(res, 400, "FAILED", "Invalid coordinates");
    }

    const baseQuery = searchKey
      ? {
          $or: [
            { store_name: { $regex: searchKey, $options: "i" } },
            { address: { $regex: searchKey, $options: "i" } },
          ],
        }
      : {};

    const topFiveCategories = await categoryService.getTopFiveCategoryWithSubcategories();

    // 🔹 Popular Stores
    const popularStoresRaw = await Store.find(baseQuery)
      .select("store_name store_id image_url location address rating store_type primary_services")
      .limit(5);

      
      const popularStores = popularStoresRaw
      .map((store) => {
        const [lng, lat] = store.location.coordinates;
        const dist = getDistanceFromLatLonInKm(latitude, longitude, lat, lng);
        if (dist <= maxAllowedDistance) {
          
          return {
            _id : store._id,
            store_id : store.store_id,
            store_name: store.store_name,
            store_type: store.store_type,
            primary_services: store.primary_services,
            image_url: store.image_url,
            location: store.location,
            address: store.address,
            rating : store.rating?.average ?? "0.0",
            distance: parseFloat(dist.toFixed(2)),
          };
        }
      })
      .filter(Boolean);

    // 🔹 Best Offer Stores
    const bestOfferStoresRaw = await Store.find({
      ...baseQuery,
    })
      .select("store_name store_id image_url location address rating offers store_type primary_services")
      .limit(5);

    const offerStores = bestOfferStoresRaw
      .map((store) => {
        const [lng, lat] = store.location.coordinates;
        const dist = getDistanceFromLatLonInKm(latitude, longitude, lat, lng);
        if (dist <= maxAllowedDistance) {
          return {
            _id : store._id,
            store_id : store.store_id,
            store_name: store.store_name,
            store_type: store.store_type,
            primary_services: store.primary_services,
            image_url: store.image_url,
            location: store.location,
            address: store.address,
            rating : store.rating?.average ?? "0.0",
            offers: store.offers,
            distance: parseFloat(dist.toFixed(2)),
          };
        }
      })
      .filter(Boolean);

    // 🔹 Trending Stores
    const trendingStoresRaw = await Store.find(baseQuery)
      .select("store_name store_id image_url rating location address store_type primary_services")
      .limit(5);

    const recommended_stores = trendingStoresRaw
      .map((store) => {
        const [lng, lat] = store.location.coordinates;
        const dist = getDistanceFromLatLonInKm(latitude, longitude, lat, lng);
        if (dist <= maxAllowedDistance) {
          return {
            _id : store._id,
            store_id : store.store_id,
            store_name: store.store_name,
            store_type: store.store_type,
            primary_services: store.primary_services,
            image_url: store.image_url,
            location: store.location,
            address: store.address,
            rating : store.rating?.average ?? "0.0",
            distance: parseFloat(dist.toFixed(2)),
          };
        }
      })
      .filter(Boolean);

    const trendingServices = [
      { _id: "68677a385fe073bacbcf1930", service: "Shaving", rating: "4.0", amount: "₹100 - ₹400",url: "https://picsum.photos/id/1/200/300" },
      { _id: "68677a385fe073bacbcf1932",service: "Haircut Styles", rating: "4.0", amount: "₹100 - ₹400", url: "https://picsum.photos/id/1/200/300"},
      { _id: "68677a385fe073bacbcf1933",service: "Waxing", rating: "4.0", amount: "₹100 - ₹400", url: "https://picsum.photos/id/1/200/300" },
      { _id: "68677a385fe073bacbcf1934",service: "Threading", rating: "4.0", amount: "₹100 - ₹400", url: "https://picsum.photos/id/1/200/300" },
    ];

    // Fallback if empty
    const response = {
      categories: topFiveCategories,
      popular_stores: popularStores.length
        ? popularStores
        : "No nearby popular stores",
      best_offer_stores: offerStores.length
        ? offerStores
        : "No nearby offer stores",
      trending_services: trendingServices ? trendingServices : "No trending services found",
      recommended_stores: recommended_stores.length
        ? recommended_stores
        : "No stores found",
    };

    sendResponse(
      res,
      200,
      "SUCCESS",
      "Store details fetched successfully",
      response
    );
  } catch (error) {
    console.error("Error retrieving store details:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};

const getStoreSearchDetails = async (req, res) => {
  try {
    const { searchKey, lng, lat } = req.query;

    if (!searchKey && (!lng || !lat)) {
      return sendResponse(
        res,
        400,
        "FAILED",
        "Please provide a search keyword as (storeName or Address) or lng and lat"
      );
    }

    let store;
    // Search in store_name OR address using regex
    if (searchKey && lat && lng) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const distance = 5000;

      if (isNaN(longitude) || isNaN(latitude)) {
        return sendResponse(res, 400, "FAILED", "Invalid coordinates");
      }

      const nearbyStores = await Store.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: distance,
          },
        },
      });

      // 2️⃣ Get catalogs with ONLY matching services
      const catalogs = await catalogModel.find(
        {
          store_id: { $in: nearbyStores.map(s => s.store_id) },
          "services.name": { $regex: new RegExp(searchKey, "i") },
        },
        {
          store_id: 1,
          services: {
            $filter: {
              input: "$services",
              as: "service",
              cond: {
                $regexMatch: {
                  input: "$$service.name",
                  regex: searchKey,
                  options: "i",
                },
              },
            },
          },
        }
      );

      // 3️⃣ Map store_id → matched services
      const serviceMap = {};
      catalogs.forEach(cat => {
        serviceMap[cat.store_id.toString()] = cat.services;
      });

      // 4️⃣ Attach ONLY matched services to store
      const result = nearbyStores
        .filter(store => serviceMap[store.store_id.toString()])
        .map(store => ({
          ...store.toObject(),
          services: serviceMap[store.store_id.toString()],
        }));

      return sendResponse(
        res,
        200,
        "SUCCESS",
        "Nearby stores with matched services",
        result
      );
    } else if (searchKey) {
      const store = await Store.findOne({
        $or: [
          { store_name: { $regex: searchKey, $options: "i" } },
          { address: { $regex: searchKey, $options: "i" } },
        ],
      });

      const catalog = await catalogModel.findOne(
        {
          store_id: store.store_id,
          "services.name": { $regex: new RegExp(searchKey, "i") },
        },
        {
          services: {
            $filter: {
              input: "$services",
              as: "service",
              cond: {
                $regexMatch: {
                  input: "$$service.name",
                  regex: searchKey,
                  options: "i",
                },
              },
            },
          },
        }
      );

      return sendResponse(res, 200, "SUCCESS", "Store found", {
        ...store.toObject(),
        services: catalog?.services || [],
      });

    } else {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const distance = 5000;

      if (isNaN(longitude) || isNaN(latitude)) {
        return sendResponse(res, 400, "FAILED", "Invalid coordinates");
      }

      store = await Store.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: distance,
          },
        },
      });

      if (!store) {
        return sendResponse(res, 400, "FAILED", "Store not found");
      }

      sendResponse(res, 200, "SUCCESS", "Store details fetched successfully", {
        store,
      });
    }
  } catch (error) {
    console.error("Error retrieving store details:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};

const getStorePopularServices = async(req, res) => {
  try {
    const { store_id } = req.query;

    const result = await catalogService.getCatalogByStoreTopFive(store_id);

    if (!result.success) {
      return sendResponse(res, 400, "FAILED", "Catalog not found");
    }
    return sendResponse(
      res,
      200,
      "SUCCESS",
      "Catalog Found successfully",
      result.data
    );
  } catch (error) {
    console.error("Error fetching store top services:", error);
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const getSuggestedServices = async(req, res) => {
  try {
    const { store_id } = req.query;

    const result = await catalogService.getCatalogByStoreTopFiveSuggested(store_id);

    if (!result.success) {
      return sendResponse(res, 400, "FAILED", "Catalog not found");
    }
    return sendResponse(
      res,
      200,
      "SUCCESS",
      "Catalog Found successfully",
      result.data
    );
  } catch (error) {
    console.error("Error fetching store top services:", error);
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const registerStoreDetails = async (req, res) => {
  try {
    const { ...storeData } = req.body;
    const country_code = storeData.country_code;
    const phone_number = storeData.phone_number;

    if (!country_code || !phone_number) {
      return sendResponse(
        res,
        400,
        "FAILED",
        "Country code and phone_number is required"
      );
    }

    // Construct fullPhoneNumber
    const fullPhoneNumber = `${country_code}${phone_number}`;

    // Find user by fullPhoneNumber
    const user = await Merchant.findOne({ phone_number: fullPhoneNumber });

    if (!user) {
      return sendResponse(res, 400, "FAILED", "User not found");
    }

    // Check if the user already has a store
    const existingStore = await Store.findOne({ userId: user._id });

    if (existingStore) {
      return sendResponse(res, 400, "FAILED", "Store already exists");
    }

    // Generate an auto-incremented store_id
    const lastStore = await Store.findOne().sort({ store_id: -1 });
    const newStoreId = lastStore ? lastStore.store_id + 1 : 10000; // Start from 1001

    storeData.phone_number = fullPhoneNumber;

    const storeRegistered = await storeService.registerStoreDetails(
      newStoreId,
      storeData,
      fullPhoneNumber
    );

    if (!storeRegistered) {
      return sendResponse(res, 409, "FAILED", "Store registration failed");
    }

    return sendResponse(res, 201, "SUCCESS", "Store registerd successfully", {
      storeRegistered,
    });
  } catch (error) {
    console.error("Error registering store:", error);
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const updateStoreDetails = async (req, res) => {
  try {
    const storeId = parseInt(req.query.store_id, 10);
    const updatedData = req.body;

    if (!storeId) {
      return sendResponse(res, 400, "FAILED", "Store id required");
    }
    const store = await Store.findOneAndUpdate(
      { store_id: storeId },
      updatedData,
      { new: true }
    );

    if (!store) {
      return sendResponse(res, 400, "FAILED", "Store not found");
    }

    return sendResponse(res, 200, "SUCCESS", "Store updated successfully", {
      store,
    });
  } catch (error) {
    console.error("Error registering store:", error);
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const rateStore = async(req,res) => {
  try{
    const token = req.header("Authorization");
    if (!token) {
        return sendResponse(res, 401, "FAILED", "Access denied. No token provided.");
    }

    let decodedUser;
    try {
        decodedUser = jwt.verify(token, config.JWT_SECRET);;
    } catch (err) {
        return sendResponse(res, 403, "FAILED", "Invalid or expired token.");
    }

    const { storeId } = req.query;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendResponse(res, 400, "Rating must be between 1 and 5")
    }
    
    const storeRating = await storeService.storeRating(storeId, decodedUser._id, rating, review)
    if(!storeRating.success){
      return sendResponse(res, 400, storeRating.message)
    }
    return sendResponse(res, 200, "SUCCESS", "Store updated successfully", storeRating.message)

  }catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

module.exports = {
  getStoreDetails: getStoreDetails,
  getStoreSearchDetails: getStoreSearchDetails,
  getStorePopularServices: getStorePopularServices,
  getSuggestedServices: getSuggestedServices,
  getAllStoreDetails: getAllStoreDetails,
  getHomeStoreDetails: getHomeStoreDetails,
  registerStoreDetails: registerStoreDetails,
  updateStoreDetails: updateStoreDetails,
  rateStore: rateStore
};
