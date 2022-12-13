var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ClientSession } = require('mongodb')
//const otp=require('../config/otp')
require('dotenv').config()
const Client=require('twilio')(process.env.accountSid,process.env.authToken)
var objectId=require('mongodb').ObjectId
const Razorpay=require('razorpay')
var instance = new Razorpay({ 
    key_id: 'rzp_test_ewNm9lY0xHIOAt', 
    key_secret: 'LvRkZI5kqXJXPIjiU2CSTAqQ' 
});

                

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
                let mobileNo=await db.get().collection(collection.USER_COLLECTION).findOne({mobile:userData.mobile})
            if(user || mobileNo){
                resolve({status:false})
            }
            else{
                userData.password=await bcrypt.hash(userData.password,10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                    // console.log(response,"--------------------responsecheck--------------------");
                    resolve({status:true})
                
            }    
            } catch (error) {
                let err={}
                err.message="Unable to signup "
                reject(err)
            }
            
        })
    },

    doLogIn:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            try {
                let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    // console.log(status,"result check");
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        // console.log(response,"response check 1" );
                        resolve(response)
                    }
                    else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }
            else{
                console.log("login failed");
                resolve({status:false})
            }
            } catch (error) {
                let err={}
                err.message="Unable to login "
                reject(err)
            }
            
        })

    },


    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
            // console.log(users);
            } catch (error) {
                let err={}
                err.message="Unable to login "
                reject(err)
            }
            

        })
    },

    doOtpLogin:(userData)=>{
        let response={}
        return new Promise(async (resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({mobile:userData.mobile})
            if(user){
                // console.log(user,"userdata after otp post");
                response.status=true;
                response.user=user;
                // console.log(response,"=====response in otplogin helper====");
                Client.verify.services(process.env.serviceId)
                .verifications
                .create({to:`+91${userData.mobile}`,channel:'sms'})
                .then((data)=>{      
                })
                resolve(response)
            }
            else{
                response.status=false;
                resolve(response)
            }
        })
        
    },

    doVerifyOtp:(verifyOtp,userData)=>{
        return new Promise((resolve,reject)=>{
            console.log(userData,"===userData from==== ");
            Client.verify.services(process.env.serviceId)
            .verificationChecks
            .create({
                to:`+91${userData.mobile}`,
                code:verifyOtp.otp
            })
            .then((data)=>{
                if(data.status=='approved'){
                    resolve({status:true})
                }
                else{
                    resolve({status:false})
                }
            })
        })
    },
            //CART
     doAddToCart:(prodId,userId)=>{
        let prodObj={
            item:objectId(prodId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)}) 
            if(userCart){
                let prodExist=userCart.products.findIndex(product=>product.item==prodId)
                console.log(prodExist,"===prod exist or not===");
                if(prodExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).
                    updateOne({user:objectId(userId),'products.item':objectId(prodId)},
                    {
                        $inc: {'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }
                else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId)},
                        {
                                $push:{products:prodObj}
                        }).then((response)=>{
                            resolve()
                        })
                }
                
            }
            else{
                let cartObj={
                    user:objectId(userId),
                    products:[prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    // console.log(response,"===what we get after adding to cart ====");
                    resolve()
                })
            }
        })
    },


    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION)
            .aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                         item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                ]).toArray()
                // console.log(cartItems[0].products,"====Products in cart of user=========");
                resolve(cartItems)
            })
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
       

    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
            
        })
    },

    doChangeproductQuantity:(details)=>{
        
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)

        // console.log(details,"=====checking details=====");
        
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).
                    updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{products:{item:objectId(details.product)}}
                    }
                    ).then((response)=>{
                        // console.log(response,"========response check of less thn 1=====");
                        resolve({removeProduct:true})
                    })
            }
            else{
                db.get().collection(collection.CART_COLLECTION).
                updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                {
                    $inc:{'products.$.quantity':details.count}
                }
                ).then((response)=>{
                    // console.log(response,"====response chk after adding====");
                    resolve({status:true})   
                })
            }
            
        })
    },

    doRemoveCartItem:(details)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).
                    updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{products:{item:objectId(details.product)}}
                    }
                    ).then((response)=>{
                        resolve({removeProduct:true})
                    })
        })
    },

    //to get total amount

    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION)
            .aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                         item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }
                }
                ]).toArray()
                console.log(total[0],"===total amount of quantity * price=====");
                resolve(total[0].total)
            })
    },


    //get cart details for order
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            // resolve(cart.products)
            resolve(cart)
        })
    },
    //place order 
    placeOrder:(orderDetails,products,total)=>{
        return new Promise((resolve,reject)=>{
            // console.log(orderDetails,products,total,"===placeorder parameters===");
            let status=orderDetails['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    address:orderDetails.address,
                    city:orderDetails.city,
                    pincode:orderDetails.pincode,
                    mobile:orderDetails.mobile
                },
                userId:objectId(orderDetails.userId),
                paymentMethod:orderDetails['payment-method'],
                products:products,
                totalPrice:total,
                date:new Date(),
                status:status
                

            }
            console.log(orderObj,"===ORDER OBJECT===");
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(orderDetails.userId)})
                
                resolve(response.insertedId)
            })
        })

    },

    //get order details
    getOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
            resolve(orderDetails)
        })
    },


    getProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let totalOrderDetails=await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products.products'
                },
                {
                    $project:
                    {
                        item:'$products.products.item',
                        quantity:'$products.products.quantity',
                        totalPrice:'$totalPrice'
                        
                    }
                },
                {
                    $lookup:
                    {
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'productDetails'
                    }
                },
                {
                    $project:
                    {
                        item:1,quantity:1,totalPrice:1,productDetail:{$arrayElemAt:['$productDetails',0]}
                    }
                }

            ]).toArray()
            console.log(totalOrderDetails,"Total Order Details");
            resolve(totalOrderDetails)
        })
    },

    // generateRazorpay:(orderId,total)=>{
    //     return new Promise((resolve,reject)=>{
    //         var options= {
    //             amount: total,
    //             currency: "INR",
    //             receipt: ""+orderId
    //         };
    //         instance.orders.create(options,function(err,order){
    //             console.log("New order:",order);
    //             resolve(order)
    //         });
    //     })
    // }
    
    //razorpay
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options={
                amount:total * 100,
                currency:"INR",
                receipt:orderId.toString()
            };
            instance.orders.create(options,function(err,order){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("New Order:",order);
                    resolve(order)
                }   
            })
        })

    },
    

    //payment verify 
    paymentVerification:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'LvRkZI5kqXJXPIjiU2CSTAqQ');    

            hmac.update(details['payment[razorpay_order_id]']+'|'+ details['payment[razorpay_payment_id]']);            
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }
            else{
                reject()
            }
        })
    },

    //change payment status function

    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:
                {
                    status:'placed'
                },
            }
            ).then(()=>{
                resolve()
            })
            
        })
    }
}



