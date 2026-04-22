const Catalog = require("../models/catalog.model");

class CatalogService {
  // Register a new catalog
  async createCatalog(storeId, services) {
    try {
      const existingCatalog = await Catalog.findOne({ store_id: storeId });
      if (existingCatalog) {
        return {
          success: false,
          message: "Catalog already exists for this store",
        };
      }

      const catalog = new Catalog({ store_id: storeId, services });
      await catalog.save();
      return { success: true, data: catalog };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Fetch catalog by store_id
  async getCatalogByStore(storeId, categoryId) {
    try {
      const catalog = await Catalog.findOne({ store_id: storeId });

      if (!catalog) {
        return { success: false, message: "Catalog not found" };
      }

      const services = catalog.services.filter(
        service => service.category_id === Number(categoryId)
      );

      if (!services.length) {
        return { success: false, message: "No services found for this category" };
      }

      return {
        success: true,
        data: services   // ✅ array of objects
      };

    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Fetch catalog by store_id
  async getCatalogByStoreTopFive(storeId) {
    try {
      const catalog = await Catalog.findOne({ store_id: storeId })
        .select("-__v -createdAt -updatedAt")
        .limit(5);
      if (!catalog) {
        return { success: false, message: "Catalog not found" };
      }
      return { success: true, data: catalog };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getCatalogByStoreTopFiveSuggested(storeId) {
    try {
      const catalog = await Catalog.findOne({ store_id: storeId })
        .select("-__v -createdAt -updatedAt")
        .limit(5);
      if (!catalog) {
        return { success: false, message: "Catalog not found" };
      }
      return { success: true, data: catalog };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //when store is selected show recommended services
  async getRecommendedCatalog(storeId) {
    try {
      const catalog = await Catalog.findOne({ store_id: storeId }).select(
        "-store_id"
      );
      if (!catalog) {
        return { success: false, message: "Catalog not found" };
      }
      return { success: true, data: catalog };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateServiceInCatalog(storeId, catalogId, data) {
    try {
      const catalog = await Catalog.findOne({ store_id: storeId });
      if (!catalog) {
        return { success: false, message: "Catalog not found" };
      }
      const service = catalog.services.id(catalogId);
      if (!service) {
        return { success: false, message: "Catalog Service not found" };
      }
      Object.assign(service, data);
      await catalog.save();
      return { success: true, data: catalog };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addServiceToCatalog(data) {
  try {
    const {
      store_id,
      name,
      price,
      duration,
      category_id,
      category,
      description,
      image
    } = data;

    // Basic validation
    if (!store_id || !name || !price || !duration || !category) {
      return {
        success: false,
        message: "Required fields are missing"
      };
    }

    // Find existing catalog
    let catalog = await Catalog.findOne({ store_id });

    // Create catalog if not exists
    if (!catalog) {
      catalog = new Catalog({
        store_id,
        services: []
      });
    }

    // Prevent duplicate service in same category (optional)
    const alreadyExists = catalog.services.find(
      s => s.name === name && s.category_id === category_id
    );

    if (alreadyExists) {
      return {
        success: false,
        message: "Service already exists in this category"
      };
    }

    // New service object
    const newService = {
      name,
      price,
      duration,
      category_id,
      category,
      description,
      image
    };

    catalog.services.push(newService);
    await catalog.save();

    return {
      success: true,
      message: "Service added successfully",
      data: newService
    };

  } catch (error) {
    throw new Error(error.message);
  }
}
}



module.exports = new CatalogService();
