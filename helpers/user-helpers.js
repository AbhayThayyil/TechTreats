var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ClientSession } = require("mongodb");
const moment = require("moment");
const { uid } = require("uid");
const dotenv = require("dotenv").config();

//const otp=require('../config/otp')

var objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const { resolve } = require("path");

// Razor Pay
var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// Paypal

const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

module.exports = {
  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ email: userData.email });
        let mobileNo = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ mobile: userData.mobile });
        if (user || mobileNo) {
          resolve({ status: false });
        } else {
          userData.password = await bcrypt.hash(userData.password, 10);
          db.get().collection(collection.USER_COLLECTION).insertOne(userData);
          // console.log(response,"--------------------responsecheck--------------------");
          resolve({ status: true });
        }
      } catch (error) {
        let err = {};
        err.message = "Unable to signup ";
        reject(err);
      }
    });
  },

  doLogIn: (userData) => {
    console.log(userData, "login check ");
    return new Promise(async (resolve, reject) => {
      try {
        let loginStatus = false;
        let response = {};
        let user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ email: userData.email });
        if (user) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            // console.log(status,"result check");
            if (status) {
              console.log("login success");
              response.user = user;
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
      } catch (error) {
        let err = {};
        err.message = "Unable to login ";
        reject(err);
      }
    });
  },

  getAllUsers: (pageNumber) => {
    return new Promise(async (resolve, reject) => {
      try {
        const prodLimit = 5;
        let users = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find()
          .skip((pageNumber - 1) * prodLimit)
          .limit(prodLimit)
          .toArray();

        const totalUsers = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .countDocuments();
        const totalPages = Math.ceil(totalUsers / prodLimit);

        let userObj = {
          users: users,
          totalUsers: totalUsers,
          totalPages: totalPages,
        };
        resolve(userObj);
        // console.log(users);
      } catch (error) {
        let err = {};
        err.message = "Unable to login ";
        reject(err);
      }
    });
  },

  //CART
  doAddToCart: (prodId, userId) => {
    let prodObj = {
      item: objectId(prodId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      try {
        let userCart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (userCart) {
          let prodExist = userCart.products.findIndex(
            (product) => product.item == prodId
          );
          console.log(prodExist, "===prod exist or not===");
          if (prodExist != -1) {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: objectId(userId), "products.item": objectId(prodId) },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              )
              .then(() => {
                resolve();
              });
          } else {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $push: { products: prodObj },
                }
              )
              .then((response) => {
                resolve();
              });
          }
        } else {
          let cartObj = {
            user: objectId(userId),
            products: [prodObj],
          };
          db.get()
            .collection(collection.CART_COLLECTION)
            .insertOne(cartObj)
            .then((response) => {
              // console.log(response,"===what we get after adding to cart ====");
              resolve();
            });
        }
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();
        // console.log(cartItems[0].products,"====Products in cart of user=========");
        resolve(cartItems);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },
  // {
  //     $lookup:{
  //         from:collection.PRODUCT_COLLECTION,
  //         let:{prodList:'$products'},
  //         pipeline:[
  //             {
  //                 $match:{
  //                     $expr:{
  //                         $in:['$_id','$$prodList']
  //                     }
  //                 }
  //             }
  //         ],
  //         as:'cartItems'
  //     }
  // }

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (cart) {
          count = cart.products.length;
        }
        resolve(count);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  doChangeproductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    // console.log(details,"=====checking details=====");

    return new Promise((resolve, reject) => {
      try {
        if (details.count == -1 && details.quantity == 1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: objectId(details.cart) },
              {
                $pull: { products: { item: objectId(details.product) } },
              }
            )
            .then((response) => {
              // console.log(response,"========response check of less thn 1=====");
              resolve({ removeProduct: true });
              console.log(response, "this is response");
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                _id: objectId(details.cart),
                "products.item": objectId(details.product),
              },
              {
                $inc: { "products.$.quantity": details.count },
              }
            )
            .then((response) => {
              // console.log(response,"====response chk after adding====");
              resolve({ status: true });
              console.log(response, "this is resposne");
            });
        }
      } catch (error) {
        console.log(error);
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  doRemoveCartItem: (details) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //to get total amount

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
              },
            },
          ])
          .toArray();
        //console.log(total[0],"===total amount of quantity * price=====");
        resolve(total[0].total);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //get cart details for order
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        // resolve(cart.products)
        resolve(cart);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },
  //place order
  placeOrder: (orderDetails, products, total, discount, final) => {
    // products.products.status="placed"
    return new Promise((resolve, reject) => {
      try {
        console.log(
          products,
          "==================what is products============="
        );
        //  console.log(orderDetails,products,total,"===placeorder parameters===");

        let date = new Date();
        // console.log(date,"checking date");

        let status =
          orderDetails["payment-method"] === "COD" ? "placed" : "pending";
        products.products.forEach((products) => {
          products.status = status;
        });
        let addressObj = {
          address: orderDetails.address,
          city: orderDetails.city,
          pincode: orderDetails.pincode,
          mobile: orderDetails.mobile,
        };
        // console.log(orderDetails,"============what is in order details========");
        let orderObj = {
          deliveryDetails: addressObj,
          userId: objectId(orderDetails.userId),
          userName: orderDetails.userName,
          paymentMethod: orderDetails["payment-method"],
          products: products.products,
          totalPrice: total,
          discountPrice: discount,
          finalPrice: final,
          date: date,
          OrderStatus: status,
        };
        console.log(orderObj, "===ORDER OBJECT===");
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .insertOne(orderObj)
          .then((response) => {
            db.get()
              .collection(collection.CART_COLLECTION)
              .deleteOne({ user: objectId(orderDetails.userId) });

            resolve(response.insertedId);
          });
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //get order details
  getOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderDetails = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ userId: objectId(userId) })
          .sort({ _id: -1 })
          .toArray();
        // let userDetails=await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId)}).toArray()
        // let name=userDetails[0].name
        // orderDetails.name=name
        // console.log(orderDetails,"is it all good");

        // let data={orderDetails,name}

        resolve(orderDetails);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  getProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: { _id: objectId(orderId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
                totalPrice: "$totalPrice",
                discountPrice: "$discountPrice",
                finalPrice: "$finalPrice",
                status: "$products.status",
                cancelReason: "$products.cancelReason",
                returnReason: "$products.returnReason",
                userName: "$userName",
                paymentMethod: "$paymentMethod",
                address: "$deliveryDetails.address",
                city: "$deliveryDetails.city",
                pincode: "$deliveryDetails.pincode",
                date: "$date",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "productDetails",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                totalPrice: 1,
                discountPrice: 1,
                finalPrice: 1,
                status: 1,
                cancelReason: 1,
                returnReason: 1,
                userName: 1,
                paymentMethod: 1,
                date: 1,
                productDetail: { $arrayElemAt: ["$productDetails", 0] },
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                totalPrice: 1,
                discountPrice: 1,
                finalPrice: 1,
                status: 1,
                cancelReason: 1,
                returnReason: 1,
                userName: 1,
                paymentMethod: 1,
                date: 1,
                productDetail: 1,
                finalAmount: {
                  $multiply: ["$productDetail.price", "$quantity"],
                },
              },
            },
          ])
          .toArray()
          .then(async (totalOrderDetails) => {
            let userAddress = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .find({ _id: objectId(orderId) })
              .toArray();
            let address = userAddress[0].deliveryDetails;
            let name = userAddress[0].userName;
            totalOrderDetails.address = address;
            totalOrderDetails.name = name;
            console.log(totalOrderDetails, "Total Order Details");
            resolve(totalOrderDetails);
          });

        // console.log(address,"user address");
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //razorpay
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      try {
        var options = {
          amount: total * 100,
          currency: "INR",
          receipt: orderId.toString(),
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          } else {
            console.log("New Order:", order);
            resolve({ razorpaySuccess: true, order });
          }
        });
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //payment verify
  paymentVerification: (details) => {
    return new Promise((resolve, reject) => {
      try {
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);

        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject();
        }
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  // paypal order

  createPaypalOrder: (payment) => {
    return new Promise((resolve, reject) => {
      paypal.payment.create(payment, (err, payment) => {
        if (err) {
          reject(err);
        } else {
          resolve(payment);
        }
      });
    });
  },

  // To get paypal order details
  getPaypalOrderData: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let productData = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) });
      //console.log(productData.products,"What is in order");
      resolve(productData);
    });
  },

  //change payment status function

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      try {
        let user = db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: objectId(orderId) });
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                "products.$[].status": "placed",
              },
            }
          )
          .then(() => {
            db.get()
              .collection(collection.CART_COLLECTION)
              .deleteOne({ user: objectId(user.userId) });
            resolve();
          });
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //to add address
  doAddAddress: (userAddress) => {
    id = userAddress.userId;
    // console.log(id,"user id in user helper");
    return new Promise(async (resolve, reject) => {
      try {
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(id) },
            {
              $addToSet: {
                address: userAddress,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //get address
  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userData = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find({ _id: objectId(userId) })
          .toArray();
        let length = userData.length;
        let address = userData[0].address;
        console.log(length);
        resolve(address);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  //delete address
  doDeleteAddress: (data) => {
    console.log(data, "what is in data of delete address");
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(data.user) },
            {
              $pull: { address: { addressid: data.address } },
            }
          )
          .then((response) => {
            resolve({ deleteAddress: true });
          });
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  getUniqueAddress: (userId, addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .aggregate([
            {
              $match: { _id: objectId(userId) },
            },
            {
              $unwind: "$address",
            },
            {
              $match: {
                "address.addressid": addressId,
              },
            },
            {
              $project: {
                address: "$address.address",
                city: "$address.city",
                pincode: "$address.pincode",
                mobile: "$address.mobile",
                addressId: "$address.addressid",
              },
            },
          ])
          .toArray();
        console.log(address[0], "what is in address");
        resolve(address[0]);
      } catch (error) {
        let err = {};
        err.message = "Something went wrong ";
        reject(err);
      }
    });
  },

  // To get address from selection
  getAddressFromSelection: (addressId) => {
    return new Promise(async (resolve, reject) => {
      let selectedAddress = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ address: { $elemMatch: { addressid: addressId } } });
      console.log(selectedAddress, "plsss come address");
    });
  },

  //decrease stock
  decreaseStock: (products) => {
    return new Promise((resolve, reject) => {
      if (products != null) {
        let allProducts = JSON.parse(products);
        let limit = allProducts.products.length;
        console.log(limit, "limit");

        for (i = 0; i < limit; i++) {
          let prodId = allProducts.products[i].item;
          let prodQuantity = allProducts.products[i].quantity;

          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: objectId(prodId) },
              {
                $inc: { stock: -prodQuantity },
              }
            );
        }

        resolve();
      } else {
        reject();
      }
    });
  },

  //to cancel COD orders
  cancelCODOrder: (orderId, prodId, quantity, status, cancelReason) => {
    quantity = parseInt(quantity);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            $and: [
              { _id: objectId(orderId) },
              { "products.item": objectId(prodId) },
            ],
          },
          {
            $set: {
              "products.$.status": status,
              "products.$.cancelReason": cancelReason,
            },
          }
        )
        .then(() => {
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: objectId(prodId) },
              {
                $inc: { stock: quantity },
              }
            )
            .then(() => {
              resolve({ status: true, orderId, prodId, cancelReason });
            })
            .catch(() => {
              reject();
            });
        });
    });
  },

  //cancel order
  cancelOrder: (orderId, prodId, quantity, status, cancelReason) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            $and: [
              { _id: objectId(orderId) },
              { "products.item": objectId(prodId) },
            ],
          },
          {
            $set: {
              "products.$.status": status,
              "products.$.cancelReason": cancelReason,
            },
          }
        )
        .then(() => {
          resolve({ status: true, orderId, prodId, cancelReason });
        });
    });
  },

  //return order
  doReturnOrder: (orderId, prodId, status, returnReason) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            $and: [
              { _id: objectId(orderId) },
              { "products.item": objectId(prodId) },
            ],
          },
          {
            $set: {
              "products.$.status": status,
              "products.$.returnReason": returnReason,
            },
          }
        )
        .then(() => {
          resolve({ status: true });
        });
    });
  },

  //wallet details
  walletOperations: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { userId: objectId(userId) } },
          { $unwind: "$products" },
          { $match: { "products.status": "Returned" } },
          {
            $project: {
              orderId: "$_id",
              userId: "$userId",
              totalPrice: "$totalPrice",
              discountPrice: "$discountPrice",
              finalPrice: "$finalPrice",
              date: "$date",
              paymentMethod: "$paymentMethod",
              prodId: "$products.item",
              prodStatus: "$products.status",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "prodId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              orderId: 1,
              userId: 1,
              totalPrice: 1,
              discountPrice: 1,
              finalPrice: 1,
              paymentMethod: 1,
              date: 1,
              prodId: 1,
              prodStatus: 1,
              productDetails: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          {
            $lookup: {
              from: collection.USER_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "userData",
            },
          },
          {
            $project: {
              orderId: 1,
              userId: 1,
              totalPrice: 1,
              discountPrice: 1,
              finalPrice: 1,
              paymentMethod: 1,
              date: 1,
              prodId: 1,
              prodStatus: 1,
              productDetails: 1,
              userDetails: { $arrayElemAt: ["$userData", 0] },
            },
          },
        ])
        .sort({ _id: -1 })
        .toArray();
      console.log(wallet);
      resolve(wallet);
    });
  },

  // To show orders in Profile

  showOrdersInprofile: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { userId: objectId(userId) } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "productData",
            },
          },
          {
            $project: {
              userId: 1,
              orderId: "$_id",
              paymentMethod: 1,
              totalPrice: 1,
              discountPrice: 1,
              finalPrice: 1,
              date: 1,
              products: 1,
              productData: { $arrayElemAt: ["$productData", 0] },
            },
          },
        ])
        .sort({ orderId: -1 })
        .toArray();

      orders.forEach((order) => {
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const humanReadableDate = order.date.toLocaleDateString(
          "en-US",
          options
        );
        // console.log(humanReadableDate);
        order.date = humanReadableDate;
      });
      console.log(orders, "These are orders to show in profile");
      resolve(orders);
    });
  },

  // To remove pending status after a payment fail

  removePendingStatus: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .deleteMany({ products: { $elemMatch: { status: "pending" } } })
        .then(() => {
          resolve();
        });
    });
  },

  // To get a particular user details to display in edit user creds

  getUserData: (userId) => {
    return new Promise(async (resolve, reject) => {
      userData = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      console.log(userData, "particular user data");
      resolve(userData);
    });
  },

  // To update basic user data/creds

  updateBasicUserData: (userId, userData) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          { $set: { name: userData.name, mobile: userData.mobile } }
        )
        .then(() => {
          resolve();
        });
    });
  },

  // To update important user creds (username/password)

  updateImportantUserData: (userId, userData) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      if (user) {
        console.log(userData, user);
        
          userData.NewPassword = await bcrypt.hash(userData.NewPassword, 10);
          console.log(userData.NewPassword, "new password check");
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              {
                $set: { email: userData.email, password: userData.NewPassword },
              }
            )
            .then(() => {
              resolve();
            });
        
        
      } else {
        console.log("No user ");
      }
    });
  },
};
