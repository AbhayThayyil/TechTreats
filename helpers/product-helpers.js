var db = require("../config/connection");
var collection = require("../config/collection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product, callback) => {
    // console.log(product);
    // console.log(product,"====add product=======");
    product.stock = parseInt(product.stock);
    product.price = parseInt(product.price);
    console.log(product.price);
    try {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(product)
        .then((data) => {
          callback(data.insertedId);
          // console.log(data.insertedId);
        });
    } catch (error) {
      let err = {};
      err.message = "cannot add product";
      reject(err);
    }
  },
  getAllProductsOnly: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(products);
    });
  },

  getAllProducts: (pageNumber) => {
    return new Promise(async (resolve, reject) => {
      try {
        const prodLimit = 5;

        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .sort({ _id: -1 })
          .skip((pageNumber - 1) * prodLimit)
          .limit(prodLimit)
          .toArray();
        console.log(
          products,
          "=====================products stored in products variable after getting it from DB========="
        );
        const totalProducts = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .countDocuments();
        const totalPages = Math.ceil(totalProducts / prodLimit);

        let productObj = {
          products: products,
          totalProds: totalProducts,
          totalPgs: totalPages,
          pageNo: pageNumber,
        };

        resolve(productObj);
      } catch (error) {
        let err = {};
        err.message = "cannot get all products";
        reject(err);
      }
    });
  },
  // To get total product count
  getTotalProductCount: () => {
    return new Promise(async (resolve, reject) => {
      const totalProducts = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .countDocuments();
      resolve(totalProducts);
    });
  },

  getAllProductsWithCategory: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ category: categoryName })
          .sort({ _id: -1 })
          .toArray();
        // console.log(products,"=====================products stored in products variable after getting it from DB=========");
        console.log(products, "cat products");
        resolve(products);
      } catch (error) {
        let err = {};
        err.message = "cannot get all products";
        reject(err);
      }
    });
  },

  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(prodId) })
          .then((product) => {
            resolve(product);
          });
      } catch (error) {
        let err = {};
        err.message = "Unable to access product detail";
        reject(err);
      }
    });
  },

  deleteProduct: (prodId) => {
    // console.log(prodId,"prod ID check");
    return new Promise(async (resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .deleteOne({ _id: objectId(prodId) })
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        let err = {};
        err.message = "Unable to delete product ";
        reject(err);
      }
    });
  },

  updateProduct: (prodId, prodDetails) => {
    prodDetails.stock = parseInt(prodDetails.stock);
    prodDetails.price = parseInt(prodDetails.price);
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: objectId(prodId) },
            {
              $set: {
                name: prodDetails.name,
                category: prodDetails.category,
                price: prodDetails.price,
                description: prodDetails.description,
                stock: prodDetails.stock,
                image: prodDetails.image,
              },
            }
          )
          .then((response) => {
            resolve();
          });
      } catch (error) {
        let err = {};
        err.message = "Unable to update product ";
        reject(err);
      }
    });
  },

  getSingleProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(prodId) });
        resolve(product);
      } catch (error) {
        let err = {};
        err.message = "Unable to access single product ";
        reject(err);
      }
    });
  },

  //to change order status of product

  changeOrderStatus: (data) => {
    // console.log(data,"what is passed to change order status from admin controller");
    let orderId = data.order;
    let prodId = data.product;
    let value = data.changeValue;

    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId), "products.item": objectId(prodId) },
            {
              $set: { "products.$.status": value },
            }
          )
          .then((response) => {
            resolve(response);
          });
        // response.value=value
        //     if(value=="Returned"){
        //         db.get().collection(collection.ORDER_COLLECTION)
        // .aggregate([
        //     {$match:{_id:objectId(orderId)}},
        //     {$unwind:'$products'},
        //     {$match:{'products.status':"Returned"}},
        //     {$project:{
        //         orderId:'$_id',
        //         userId:'$userId',
        //         totalPrice:'$totalPrice',
        //         date:'$date',
        //         paymentMethod:'$paymentMethod',
        //         prodId:'$products.item',
        //         prodStatus:'$products.status'
        //     }},
        //     {$lookup:{
        //         from: collection.PRODUCT_COLLECTION,
        //         localField: 'prodId',
        //         foreignField: '_id',
        //         as: 'productDetails'
        //     }},
        //     {$project:{
        //         orderId:1,
        //         userId:1,
        //         totalPrice:1,
        //         paymentMethod:1,
        //         date:1,
        //         prodId:1,
        //         prodStatus:1,
        //         productDetails:{$arrayElemAt:['$productDetails',0]}
        //     }},
        //     {$lookup:{
        //         from: collection.USER_COLLECTION,
        //         localField: 'userId',
        //         foreignField: '_id',
        //         as: 'userData'
        //     }},
        //     {$project:{
        //         orderId:1,
        //         userId:1,
        //         totalPrice:1,
        //         paymentMethod:1,
        //         date:1,
        //         prodId:1,
        //         prodStatus:1,
        //         productDetails:1,
        //         userDetails:{$arrayElemAt:['$userData',0]}
        //     }}

        // ]).sort({_id:-1}).toArray().then((response)=>{
        //     console.log(response);
        //     let walletBalance=0
        //     for (let i = 0; i < response.length; i++) {
        //          walletBalance = walletBalance+response[i].totalPrice;
        //          walletObj={
        //             date:response[i].date,
        //             name:response[i].productDetails.name,
        //             paymentMethod:response[i].paymentMethod,
        //             amount:response[i].totalPrice,
        //             userName:response[i].userDetails.name
        //          }
        //     }
        //     let userId=response.userId

        //     db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
        //     {$push:{walletAmount:walletBalance,walletHistory:walletObj}})
        // }).then((wallet)=>{
        //     resolve(wallet)
        // })
        //     }
      } catch (error) {
        let err = {};
        err.message = "Unable to access single product ";
        reject(err);
      }
    });
  },
  storeReview: (reviewData, userId, prodId) => {
    return new Promise(async (resolve, reject) => {
      let userProductDelivered = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: objectId(userId),
              products: {
                $elemMatch: {
                  item: objectId(prodId),
                  status: "Delivered",
                },
              },
            },
          },
        ])
        .toArray();
      console.log(userProductDelivered, "If user has this product delivered");

      if (userProductDelivered.length !== 0) {
        console.log("User has this product delivered");
        let userData = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ _id: objectId(userId) });
        let productData = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(prodId) });

        //console.log(userData,"user details");
        let userDataForReview = {
          userId: objectId(userId),
          name: userData.name,
          email: userData.email,
          reviewTitle: reviewData.reviewTitle,
          reviewContent: reviewData.reviewContent,
          reviewRating: parseInt(reviewData.reviewRating),
          date: new Date(),
        };

        //console.log(productData,"product data");
        if (productData.reviewData) {
          console.log("Review data not empty");

          let reviewExist =await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .aggregate([
              {
                $match: {
                  _id: objectId(prodId),
                  reviewData: {
                    $elemMatch: {
                      userId: objectId(userId),
                    },
                  },
                },
              },
            ])
            .toArray();
            console.log(reviewExist,"review exist");
          if (reviewExist.length !== 0) {
            console.log("This user already reviewed");
            resolve({alreadyReviewd:true})
          } else {
            console.log("This user have not reviewed yet");
            db.get()
              .collection(collection.PRODUCT_COLLECTION)
              .updateOne(
                { _id: objectId(prodId) },
                { $push: { reviewData: userDataForReview } }
              );
            console.log("Review updated");
            resolve({reviewUpdated:true})
          }
        } else {
          console.log("Review data is empty");
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: objectId(prodId) },
              {
                $set: { reviewData: [userDataForReview] },
              }
            );
          console.log("Review updated");
          resolve({reviewUpdated:true})
        }
      }
      // MARK 1
      else {
        console.log("User do not have this product delivered, so cannot post review");
        resolve({unDelivered:true})
      }
      resolve()
    });
  },
};
