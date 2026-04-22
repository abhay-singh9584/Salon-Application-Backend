const User = require("../models/users.model");
const Customer = require("../models/customer.model")

const findUserAsCustomer = async (phone_number) => {
    try {
        const user = await User.findOne({ phone_number, role: "customer"});
        if(!user) return false;

        const isDeletedCustomer = Customer.findOne({phone_number, is_deleted: false});

        if(!isDeletedCustomer) return false;

        return user;
    } catch (error) {
        console.error("Error retrieving user details:", error);
        return null;
    }
}

const findUserAsCustomerById = async (id) => {
    try {
        const user = await User.findOne({ _id : id, role: "customer" });
        return user;
    } catch (error) {
        console.error("Error retrieving user details:", error);
        return null;
    }
}

const findUserAsMerchant = async (phone_number) => {
    try {
        const user = await User.findOne({ phone_number, role: "merchant" });
        console.log(user);
        return user;
    } catch (error) {
        console.error("Error retrieving user details:", error);
        return null;
    }
}

const createUserAsCustomer = async (phone_number) => {
    try {
        const Cuser = await User.findOneAndUpdate(
            { phone_number: phone_number, role: ["merchant"] }, // match only if exact role is ["customer"]
            { is_customer : false}, 
            { $set: { role: ["customer", "merchant"] } }, // set the new roles
            { new: true} 
          );
          if(!Cuser){
            const user = new User({phone_number: phone_number, role: ["customer"]})
            return await user.save();
          }
        return await Cuser.save();
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

const createUserAsMerchant = async (phone_number) => {
    try {
        const Cuser = await User.findOneAndUpdate(
            { phone_number: phone_number, role: ["customer"] }, // match only if exact role is ["customer"]
            { $set: { role: ["customer", "merchant"] } }, // set the new roles
            {   new: true
             } 
          );
          if(!Cuser){
            const user = new User({phone_number: phone_number, role: ["merchant"]})
            return await user.save();
          }
        return await Cuser.save();
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

const registerUserAsCustomer = async (phone_number) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
          { phone_number: phone_number}, // Filter condition
          { $set: { is_customer: true } }, // Update operation
          { new: true } // Return the updated document
        );
        return updatedUser;
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}
module.exports = {
    findUserAsCustomer : findUserAsCustomer,
    findUserAsCustomerById : findUserAsCustomerById,
    registerUserAsCustomer: registerUserAsCustomer,
    findUserAsMerchant : findUserAsMerchant,
    createUserAsCustomer : createUserAsCustomer,
    createUserAsMerchant : createUserAsMerchant,
}