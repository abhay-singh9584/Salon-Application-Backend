const StoreRating = require("../models/store.rating.model");
const Store = require("../models/stores.model");
const User = require("../models/users.model")

const registerStoreDetails = async (newStoreId, storeData,fullPhoneNumber) => {
    try {
        const userRegistered = await User.findOne({phone_number : fullPhoneNumber});
        const storeDetails = new Store({
            _id : userRegistered._id,
            store_id : newStoreId,
            ...storeData
        });

        const savedStore = await storeDetails.save();

        if(!savedStore) return false;
        
        return savedStore;
    } catch (error) {
        return null;
    }
}

const storeRating = async(storeId, customer_id, rating, review) =>{
    try{

        const store = await Store.findOne({ store_id: storeId });
        if (!store) return {message:"Invalid store id", success: false};

        let existingRating = await StoreRating.findOne({ store_id: storeId, customer_id });
        
        if (existingRating) {
            // Update existing rating
            const oldRating = existingRating.rating;
            existingRating.rating = rating;
            existingRating.review = review || existingRating.review;
            await existingRating.save();

            // Adjust average rating in Store
            store.rating.average =((store.rating.average * store.rating.count) - oldRating + rating) / store.rating.count;
        }
        else{
            await StoreRating.create({ store_id: storeId, customer_id, rating, review });

            store.rating.average =
                ((store.rating.average * store.rating.count) + rating) / (store.rating.count + 1);
            store.rating.count += 1;
        }
        await store.save();
        return {message:store.rating.average, success: true};

    }catch(error){
        return {message: error.message, success:false}
    }
}


module.exports = {
    registerStoreDetails : registerStoreDetails,
    storeRating : storeRating
};