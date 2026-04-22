const slotModel = require("../models/slot.model");
const { isSlotAvailable } = require("../utils/utils");

const createSlot = async(data) =>{
    const time=data.timing.split("-");

    const available = await isSlotAvailable(storeId = data.store_id, date=data.date, startTime=time[0], endTime=time[1]);
    if (!available) {
      return false;
    }

    const nSlot= new slotModel({
      storeID : data.store_id,
      date : data.date,
      startTime : time[0],
      endTime : time[1],
    })
  
    return await nSlot.save();

}


module.exports = {
  createSlot
};
