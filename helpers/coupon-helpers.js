var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectId

module.exports={
    doAddCoupon:(couponData)=>{
        console.log(couponData,"what is in couponData in helpers");
        couponData.daysLeft=Math.round((couponData.couponEndDate-new Date())/(1000 * 3600 * 24))

        
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
    doViewCoupon:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let coupon=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            
            resolve(coupon)
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

    isCoupon:(couponName)=>{
        console.log(couponName,"what is coupon name");
        return new Promise(async(resolve,reject)=>{
            
            let couponExist=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponName:couponName})
            // console.log(couponExist,"what is in coupon exist");
            if(couponExist!=null){
                let couponValid=await db.get().collection(collection.COUPON_COLLECTION)
                .findOne({_id:couponExist._id,couponEndDate:{$gte:new Date()},couponStartDate:{$lte:new Date()},Status:'Enable'})
                // console.log(couponValid,"valid coupon attibutes");
                if(couponValid!=null){
                    resolve(couponValid)
                }
                else{
                    console.log('expired coupon');
                    reject({couponExpired:true})
                }   
            }   
            else{
                reject({Invalid:true})
            }
            
        })
    }
}