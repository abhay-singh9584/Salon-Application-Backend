const Slot = require("../models/slot.model");
const Store = require("../models/stores.model");
const sendResponse = require("../utils/responseUtil");

const getBookedSlot = async (req,res)=>{
    try{
        const { storeID, date } = req.query;

        const store = await Store.findOne({store_id : storeID});
        if (!store){
            return sendResponse(res, 404, "FAILED", "Store not found")
        }
        const bookedSlots = await Slot.find({storeID: storeID, date: date})

        return sendResponse(res, 200, "SUCCESS", "Already booked slots", { bookedSlots })
        
    }catch(err){
        return sendResponse(res, 500, "FAILED", err.message);
    }
}

module.exports = {
    getBookedSlot
}