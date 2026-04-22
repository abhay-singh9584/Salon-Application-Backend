const catalogService = require('../services/catalog.service');
const sendResponse = require('../utils/responseUtil');

class CatalogController {
    // Register Catalog
    async registerCatalog(req, res) {
        try {
            const { store_id, services } = req.body;
            if (!store_id || typeof store_id !== "number" || !services || !Array.isArray(services)) {
                return sendResponse(res, 400, "FAILED", "Invalid Input");
            }

            const result = await catalogService.createCatalog(store_id, services);
            if(!result.success){
                return sendResponse(res, 400, "FAILED", "Catalog not found");
            }
            return sendResponse(res, 200, "SUCCESS", "Catalog Created successfully", { result });
        } catch (error) {
            return sendResponse(res, 400, "FAILED", error.message);
        }
    }

    // Fetch Catalog by store_id
    async getCatalog(req, res) {
        try {
            const storeId = parseInt(req.query.store_id, 10);
            const categoryId =  Number(req.query.category_id);
            if (isNaN(storeId)) {
                return sendResponse(res, 400, "FAILED", "Invalid Store ID");
            }

            const result = await catalogService.getCatalogByStore(storeId,categoryId);
            if(!result.success){
                return sendResponse(res, 400, "FAILED", "Catalog not found");
            }
            return sendResponse(res, 200, "SUCCESS", "Catalog Found successfully",  result.data );
        } catch (error) {
            return sendResponse(res, 400, "FAILED", error.message);
        }
    }

    //Update Catalog
    async updateCatalog(req,res){
        try{
            const storeId = parseInt(req.query.store_id, 10);
            const catalogId=req.query.catalog_id;
            console.log(storeId,catalogId);
            if (isNaN(storeId)) {
                return sendResponse(res, 400, "FAILED", "Invalid Store ID");
            }
            else if(!catalogId){
                return sendResponse(res, 400, "FAILED", "Enter Catalog ID");
            }
            const updatedService = await catalogService.updateServiceInCatalog(storeId, catalogId, req.body);
            if(!updatedService.success){
                return sendResponse(res, 400, "FAILED", "Catalog not found");
            }
            return sendResponse(res, 200, "SUCCESS", "Catalog Updated successfully", { updatedService });
        
        }
        catch(error){
            return sendResponse(res, 500, "FAILED", error.message);
        }
    }

    async addServiceToCatalog (req, res){
        try {
            const result = await catalogService.addServiceToCatalog(req.body);

            return sendResponse(res, 201, "SUCCESS", "Service added successfully", result);
        } catch (error) {
             return sendResponse(res, 500, "FAILED", error.message);
        }
    }
}

module.exports = new CatalogController();
