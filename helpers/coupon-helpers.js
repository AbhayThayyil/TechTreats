var db=require('../config/connection')
var collection=require('../config/collection');
const { COUPON_COLLECTION } = require('../config/collection');
var objectId=require('mongodb').ObjectId

module.exports={
    doAddCoupon:(couponData)=>{
        console.log(couponData,"what is in couponData in helpers");
        
        
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then(()=>{
                    resolve()
                })
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    doViewCouponOnly:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupon=await db.get().collection(collection.COUPON_COLLECTION).find()
            .toArray()
            resolve(coupon)
        })
    },
    doViewCoupon:(pageNumber)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
            const prodLimit=5;
            let coupon=await db.get().collection(collection.COUPON_COLLECTION).find()
            .skip((pageNumber-1)*prodLimit).limit(prodLimit).toArray()
            
            const totalCoupons=await db.get().collection(collection.COUPON_COLLECTION).countDocuments();
            const totalPages=Math.ceil(totalCoupons/prodLimit)
            
            let couponObj={
                coupon:coupon,
                totalCoupons:totalCoupons,
                totalPages:totalPages
            }
            resolve(couponObj)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    //get unique coupon data

    getCouponData:(couponId)=>{
        console.log(couponId,"==========coupon id ============= in helper");
        return new Promise(async(resolve,reject)=>{
            try {
                let couponData=await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:objectId(couponId)})
                console.log(couponData,"==========what is found in coupon data helper promise");
                resolve(couponData)
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
           
        })
    },

    //edit coupon post

    doEditCoupon:(couponId,couponData)=>{
        console.log(couponId,"======coupon id========");
        console.log(couponData,"===========coupon data");
        couponData.daysLeft=(couponData.couponEndDate-new Date())/(1000 * 3600 * 24)
        return new Promise(async(resolve,reject)=>{
            try {
                db.get().collection(collection.COUPON_COLLECTION)
            .updateOne({_id:objectId(couponId)},{
                $set:{
                    couponName:couponData.couponName,
                    couponDescription:couponData.couponDescription,
                    couponType:couponData.couponType,
                    couponvalue:couponData.couponvalue,
                    couponStartDate:couponData.couponStartDate,
                    couponEndDate:couponData.couponEndDate,
                    maxAmount:couponData.maxAmount,
                    usageLimit:couponData.usageLimit,
                    usageLimitUser:couponData.usageLimitUser,
                    Status:couponData.Status,
                    noOfItems:couponData.noOfItems,
                    daysLeft:Math.round(couponData.daysLeft)
                }
            })
            resolve()
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    doDeleteCoupon:(couponId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then(()=>{
                    resolve()
                })
            } catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
    },

    enterCoupon:(couponData)=>{
        let couponName=couponData.coupon
        let userId=couponData.userId
        console.log(couponName,"what is coupon name");
        return new Promise(async(resolve,reject)=>{
            
            let couponExist=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponName:couponName})
            console.log(couponExist,"what is the data if coupon exist");
            if(couponExist){

                // 1.Check if the user already used this coupon
                if(couponExist.usedBy.includes(userId)){
                    console.log("This user already used coupon");
                    reject({couponError:"This user already used coupon"})
                }
                else if(couponExist.validFrom > new Date() || couponExist.validTill < new Date()){
                    console.log("This coupon cannot be used due to validity issue");
                    reject({couponError:"This coupon cannot be used due to validity issue"})
                }
                else if(couponExist.maxUses < 1){
                    console.log("No more uses left");
                    reject({couponError:"No more uses left"})
                }
                else if (couponExist.Status=="Disable"){
                    reject({couponError:"Coupon Disabled"})
                }
                else{
                    console.log("This user have not used this coupon");
                    let totalPrice=couponData.totalPrice
                    let discountPercent=couponExist.discountPercent
                    let discountPrice=Math.round(totalPrice*(discountPercent/100))
                    let finalPrice=totalPrice-discountPrice
                    let priceObj={
                        totalPrice:totalPrice,
                        discountPrice:discountPrice,
                        finalPrice:finalPrice
                    }

                    
                    resolve({priceObj,couponSuccess:"Coupon added"})
                   
                    
                }
                // console.log(couponValid,"valid coupon attibutes");
                // if(couponValid!=null){
                //     resolve(couponValid)
                // }
                // else{
                //     console.log('expired coupon');
                //     reject({couponExpired:true})
                // }   
            }   
            else{
                reject({couponError:"Coupon does not exist"})
            }
            
        })
    },

    updateCouponStatus:(couponName,userId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).updateOne({couponName:couponName},{$inc:{maxUses:-1}}).then(()=>{
                        db.get().collection(collection.COUPON_COLLECTION).updateOne({couponName:couponName},{$push:{usedBy:userId}})
                    })
                    resolve()
        })
    }
}