var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')



module.exports = {
  doAdminLogIn: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.email });
      // console.log(admin,"Admin log ");

      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          // console.log(status,"result check");
          if (status) {
            console.log("login success");
            response.admin = admin;
            response.status = true;
            // console.log(response,"response check 1" );
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },

  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $set: {
                block: true,
              },
            }
          );
      } catch (error) {
        let err = {};
        err.message = "Cannot block user";
        reject(err);
      }
    });
  },

  unblockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              block: false,
            },
          }
        );
        } catch (error) {
            let err={}
            err.message="Cannot unblock user"
            reject(err)
        }
      
    });
  },

  adminGetOrders:()=>{
    return new Promise(async(resolve,reject)=>{
      try {
        let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).find().sort({_id:-1}).toArray()
        let userId=orderDetails[0].userId
        let userData=await db.get().collection(collection.USER_COLLECTION).find({_id:ObjectId(userId)}).toArray()
        let name=userData[0].name
        // console.log(name,"username");
        orderDetails.name=name
        // console.log(orderDetails,"show all orders");
        resolve(orderDetails)
      } catch (error) {
        let err={}
            err.message="Something went wrong"
            reject(err)
      }
       
    })
}
};