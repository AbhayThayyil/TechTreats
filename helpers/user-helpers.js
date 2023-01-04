var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ClientSession } = require('mongodb')
const moment = require('moment');
const {uid}=require('uid')

//const otp=require('../config/otp')
require('dotenv').config()
const Client=require('twilio')(process.env.accountSid,process.env.authToken)
var objectId=require('mongodb').ObjectId
const Razorpay=require('razorpay');
const { resolve } = require('path');
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
            try {
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
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
        
    },

    doVerifyOtp:(verifyOtp,userData)=>{
        return new Promise((resolve,reject)=>{
            try {
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
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },
            //CART
     doAddToCart:(prodId,userId)=>{
        let prodObj={
            item:objectId(prodId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            try {
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
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },


    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
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
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
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
            try {
                let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
            
        })
    },

    doChangeproductQuantity:(details)=>{
        
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)

        // console.log(details,"=====checking details=====");
        
        return new Promise((resolve,reject)=>{
            try {
                if(details.count==-1 && details.quantity==1){
                    db.get().collection(collection.CART_COLLECTION).
                        updateOne({_id:objectId(details.cart)},
                        {
                            $pull:{products:{item:objectId(details.product)}}
                        }
                        ).then((response)=>{
                            // console.log(response,"========response check of less thn 1=====");
                            resolve({removeProduct:true})
                            console.log(response,"this is response");
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
                        console.log(response,"this is resposne"); 
                    })
                    
                }
            } catch (error) {
                console.log(error);
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
           
            
        })
    },

    doRemoveCartItem:(details)=>{
        
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CART_COLLECTION).
                    updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{products:{item:objectId(details.product)}}
                    }
                    ).then((response)=>{
                        resolve({removeProduct:true})
                    })
            } catch (error) {
                ;
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    //to get total amount

    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
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
                //console.log(total[0],"===total amount of quantity * price=====");
                resolve(total[0].total)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
            })
    },


    //get cart details for order
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            // resolve(cart.products)
            resolve(cart)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },
    //place order 
    placeOrder:(orderDetails,products,total)=>{
        // products.products.status="placed"
        return new Promise((resolve,reject)=>{
            try {
                console.log(products,"==================what is products=============");
            //  console.log(orderDetails,products,total,"===placeorder parameters===");
            
            let date=moment(new Date()).format("dddd, Do MMM YYYY, h:mm:ss A")
            // console.log(date,"checking date");

            let status=orderDetails['payment-method']==='COD'?'placed':'pending'
            products.products.forEach(products=>{
                products.status=status
            })
            
            // console.log(orderDetails,"============what is in order details========");
            let orderObj={
                deliveryDetails:orderDetails.address[0],
                userId:objectId(orderDetails.userId),
                userName:orderDetails.userName,
                paymentMethod:orderDetails['payment-method'],
                products:products.products,
                totalPrice:total,
                date:date,
                OrderStatus:status
                

            }
            console.log(orderObj,"===ORDER OBJECT===");
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(orderDetails.userId)})
                
                resolve(response.insertedId)
            })
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })

    },

    //get order details
    getOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).sort({_id:-1}).toArray()
            // let userDetails=await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId)}).toArray()
            // let name=userDetails[0].name
            // orderDetails.name=name
            // console.log(orderDetails,"is it all good");
            
            // let data={orderDetails,name}
            
            
            
            resolve(orderDetails)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },


    getProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:
                    {
                        item:'$products.item',
                        quantity:'$products.quantity',
                        totalPrice:'$totalPrice',
                        status:'$products.status',
                        userName:'$userName',
                        paymentMethod:'$paymentMethod',
                        address:'$deliveryDetails.address',
                        city:'$deliveryDetails.city',
                        pincode:'$deliveryDetails.pincode'
                        
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
                        item:1,quantity:1,totalPrice:1,status:1,userName:1,paymentMethod:1,productDetail:{$arrayElemAt:['$productDetails',0]}
                    }
                }

            ]).toArray().then(async(totalOrderDetails)=>{
                let userAddress=await db.get().collection(collection.ORDER_COLLECTION).find({_id:objectId(orderId)}).toArray()
                let address=userAddress[0].deliveryDetails
                let name=userAddress[0].userName
                totalOrderDetails.address=address
                totalOrderDetails.name=name
                console.log(totalOrderDetails,"Total Order Details");
                resolve(totalOrderDetails)
            })
            

            
            // console.log(address,"user address");
            
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
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
            try {
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
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })

    },
    

    //payment verify 
    paymentVerification:(details)=>{
        return new Promise((resolve,reject)=>{
            try {
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
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    //change payment status function

    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            try {
                let user=db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
                db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({_id:objectId(orderId)},
                {
                    $set:
                    {
                        'products.$[].status':'placed'
                    },
                }
                ).then(()=>{
                    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(user.userId)})
                    resolve()
                })
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
           
            
        })
    },

    //to add address
    doAddAddress:(userAddress)=>{
        id=userAddress.userId
        // console.log(id,"user id in user helper");
        return new Promise(async(resolve,reject)=>{
            try {
                await db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(id)},
            {
                $addToSet:{
                    address:userAddress
                }
            }).then(()=>{
                resolve()
            })
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
       
    },

    //get address
    getAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let userData=await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId)}).toArray()
            let address=userData[0].address
            resolve(address)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
        
    },

    //delete address
    doDeleteAddress:(data)=>{
        console.log(data,"what is in data of delete address");
        return new Promise ((resolve,reject)=>{
            try {
                db.get().collection(collection.USER_COLLECTION)
                .updateOne({_id:objectId(data.user)},
                {
                    $pull:{address:{addressid:data.address}}
                }).then((response)=>{
                    resolve({deleteAddress:true})
                })
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    getUniqueAddress:(userId,addressId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let address=await db.get().collection(collection.USER_COLLECTION)
            .aggregate([
                {
                    $match:{_id:objectId(userId)}
                },
                {
                    $unwind:'$address'
                    
                },
                {
                    $match:{
                        'address.addressid':addressId
                    }
                },
                {
                    $project:{
                        address:'$address.address',
                        city:'$address.city',
                        pincode:'$address.pincode',
                        mobile:'$address.mobile',
                        addressId:'$address.addressid'
                    }
                }
                
            ]).toArray()
            console.log(address,"what is in address");
            resolve(address)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    //decrease stock
    decreaseStock:(products)=>{
        return new Promise((resolve,reject)=>{
           
            if(products!=null){
                let allProducts=JSON.parse(products)
                let limit=allProducts.products.length
                console.log(limit,"limit");
            

            for(i=0;i<limit;i++){
                let prodId=allProducts.products[i].item
                let prodQuantity=allProducts.products[i].quantity

                db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({_id:objectId(prodId)},
                {
                    $inc:{stock:-prodQuantity}
                }
                )
            }

            resolve()
        }
        else{
            reject()
        }
        })
    },

    //to cancel COD orders
    cancelCODOrder:(orderId,prodId,quantity,status)=>{
        quantity=parseInt(quantity)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({$and:[{_id:objectId(orderId)},{'products.item':objectId(prodId)}]},
            {
                $set:{'products.$.status':status}
            }
            ).then(()=>{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},
                {
                    $inc:{stock:quantity}
                }).then(()=>{
                    resolve({status:true,orderId,prodId})
                }).catch(()=>{
                    reject()
                })
            })
        })
    },

    //cancel order     
    cancelOrder:(orderId,prodId,quantity,status)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({$and:[{_id:objectId(orderId)},{'products.item':objectId(prodId)}]},
            {
                $set:{'products.$.status':status}
            }
            ).then(()=>{
                resolve({status:true,orderId,prodId})
            })
        })
    },


    //return order
    doReturnOrder:(orderId,prodId,status)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({$and:[{_id:objectId(orderId)},{'products.item':objectId(prodId)}]},
            {
                $set:{'products.$.status':status}
            }).then(()=>{
                resolve({status:true})
            })
        })
    }

}








