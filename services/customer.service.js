const Customer  = require("../models/customer.model");
const User   = require("../models/users.model");
const OTP = require("../models/otp.model");
const { generateOTP, sendOTP } = require("../utils/utils");
const Store = require("../models/stores.model");
const redisClient = require("../../config/redisClient");

const registerCustomerWithMobile = async (country_code, phone_number) => {
    try {
      const fullPhoneNumber = `${country_code}${phone_number}`;
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const expiresInSecondsforRedis = 5 * 60;

      let redisStored = false;

      // Try saving to Redis first
      try {
        await redisClient.setEx(fullPhoneNumber,expiresInSecondsforRedis,otp.toString());
        redisStored = true;
      } catch (redisError) {
        console.warn(
          "⚠️ Redis error. Falling back to MongoDB:",
          redisError.message
        );
      }

      // If Redis failed, fall back to MongoDB
      if (!redisStored) {
        await OTP.findOneAndUpdate(
          { phone_number: fullPhoneNumber },
          { otp, expires_at: expiresAt },
          { upsert: true, new: true }
        );
      }

      // Try to send OTP
      const otpSent = await sendOTP(fullPhoneNumber, otp);

      if (!otpSent) {
        // Clean up
        if (redisStored) {
          await redisClient.del(fullPhoneNumber);
        } else {
          await OTP.deleteOne({ phone_number: fullPhoneNumber });
        }
        return false;
      }
      return true;
    } catch (error) {
        return false;
    }
}

const verifyOTP = async (country_code, phone_number, otp) => {
    try {
        const fullPhoneNumber = `${country_code}${phone_number}`;

        // Try to fetch from Redis first
        const redisOTP = await redisClient.get(fullPhoneNumber);
        if (redisOTP) {
          if (redisOTP === otp.toString()) {
            // Clean up Redis
            await redisClient.del(fullPhoneNumber);
            return true;
          }
          return false;
        }else{
            const storedOTP = await OTP.findOne({ phone_number: fullPhoneNumber });
            if (!storedOTP) {
                return false;
            }

            // Check if OTP is expired
            if (Date.now() > storedOTP.expires_at) {
                await OTP.deleteOne({ phone_number: fullPhoneNumber });
                return false;
            }   

            // Compare OTP
            if (storedOTP.otp != otp) {
                return false;
            }

                await OTP.deleteOne({ phone_number: fullPhoneNumber });

            return true;
        }
    } catch (error) {
        return false;
    }
}

const findOrCreateCustomer = async (fullPhoneNumber) => {
    try {
        const customer = await Customer.findOne({ phone_number: fullPhoneNumber });
        if (customer) return customer;
        
        const newCustomer = new Customer({ phone_number: fullPhoneNumber });
        return await newCustomer.save();
    } catch (error) {
        return null;
    }
}

const findRegisteredCustomer = async (fullPhoneNumber) => {
    try {
        const customer = await Customer.findOne({ phone_number: fullPhoneNumber });
        if (customer) return customer;
        
        const newCustomer = new Customer({ phone_number: fullPhoneNumber });
        return await newCustomer.save();
    } catch (error) {
        return null;
    }
}

const deleteCustomerDetails = async (id) => {
    try {
        const result = await Customer.deleteOne({ _id: id });

        if (result.deletedCount === 1) {
            return true; // Deletion successful
        } else {
            return false; // No document found to delete
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        return null; // Error occurred
    }
}


const getCustomerDetails = async (id) => {
    try {
        const customer = await Customer.findOne({ _id: id })
            .select("-created_at -updated_at")
            .lean();

        return customer || null;
    } catch (error) {
        return null;
    }
};

const registerCustomerDetails = async (fullPhoneNumber, customer_name, age, gender) => {
    try {

        const userRegistered = await User.findOne({phone_number : fullPhoneNumber});
        const customer = new Customer({
            _id : userRegistered._id,
            phone_number: fullPhoneNumber,
            customer_name,
            age,
            gender,
        });

        const savedCustomer = await customer.save();

        if(!savedCustomer) return false;
        
        return savedCustomer
    } catch (error) {
        return null;
    }
}

const addFavoriteStore = async (user_id,store_id) => {
    try {
        // console.log(user_id);
        const customer = await Customer.findOne({ _id: user_id })
        // console.log(customer);
        if (!customer) return null;
        const store = await Store.findOne({store_id : store_id})
        if(!store){
            return null
        }
        if (!customer.favorites.includes(store_id)) {
            customer.favorites.push(store_id);
            await customer.save();
        }
        return customer;

    }
    catch(error){
        return null;
    }
}

const getFavoriteStore = async (user_id) => {
    try {
        const customer = await Customer.findOne({ _id: user_id })
        if (!customer) return null;
        const favoriteStores = await Store.find({ store_id: { $in: customer.favorites } });
        if(!favoriteStores) return null;
        return favoriteStores;
    }
    catch(error){
        return null;
    }
}

const removeFavoriteStore = async (user_id,store_id) => {
    try {
        // const fullPhoneNumber = `${country_code}${phone_number}`;
        const store = await Store.findOne({store_id : store_id})
        if(!store) return null;
        const customer = await Customer.findOne({ _id: user_id })
        if (!customer) return null;
        customer.favorites = customer.favorites.filter(id => id !== store_id);
        await customer.save();
        return customer;
    }
    catch(error){
        return null;
    }
}

const updateCustomerDetails = async (user_id, details) => {
    try {
        // console.log(details);
        const updateFields = {};
        if (details.customer_name) updateFields.customer_name = details.customer_name;
        if (details.age) updateFields.age = details.age;
        if (details.gender) updateFields.gender = details.gender;
        console.log(updateFields);
        const customer = await Customer.findOneAndUpdate(
            { _id: user_id },
            { $set: updateFields },
            { new: true } // returns updated doc
        );

        return customer;
    } catch (err) {
        console.error("Error updating customer details:", err);
        return null;
    }
};

const deleteCustomer = async (user_id) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: user_id, is_deleted: false },
            {
                is_deleted: true,
                deleted_at: new Date(),
            },
            { new: true }
        );

        if (!customer) {
            return false;
        }

        return customer;
    } catch (err) {
        console.error("Error updating customer details:", err);
        return null;
    }
};

module.exports = {
    registerCustomerWithMobile : registerCustomerWithMobile,
    verifyOTP : verifyOTP,
    findOrCreateCustomer : findOrCreateCustomer,
    findRegisteredCustomer : findRegisteredCustomer,
    getCustomerDetails : getCustomerDetails,
    registerCustomerDetails : registerCustomerDetails,
    addFavoriteStore : addFavoriteStore,
    getFavoriteStore : getFavoriteStore,
    removeFavoriteStore : removeFavoriteStore,
    deleteCustomerDetails : deleteCustomerDetails,
    updateCustomerDetails : updateCustomerDetails,
    deleteCustomer: deleteCustomer,
}