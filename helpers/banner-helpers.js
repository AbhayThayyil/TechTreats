var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId

module.exports={

    doAddBanner:(bannerData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData).then(()=>{
                resolve()
            })
        })
    },

    //to view banners
    getBannersOnly:()=>{
        return new Promise(async(resolve,reject)=>{
            let bannerData=await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(bannerData)
        })
    },

    getBanners:(pageNumber)=>{
        return new Promise(async(resolve,reject)=>{

            const prodLimit=5;
            let bannerData=await db.get().collection(collection.BANNER_COLLECTION).find()
            .skip((pageNumber-1)*prodLimit).limit(prodLimit).toArray()
            
                // console.log(bannerData,"=========banner data in banner helper==========");
                const totalBanners=await db.get().collection(collection.BANNER_COLLECTION).countDocuments()
                const totalPages=Math.ceil(totalBanners/prodLimit)

                let bannerObj={
                    bannerData:bannerData,
                    totalBanners:totalBanners,
                    totalPages:totalPages
                }
                resolve(bannerObj)
           
        })
    },

    getBannerDetails:(bannerId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerId)})
            .then((bannerDetail)=>{
                resolve(bannerDetail)
            })
        })
        
    },

    updateBanner:(bannerId,bannerInputs)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},
            {$set:{
                bannerName:bannerInputs.bannerName,
                bannerDescription1:bannerInputs.bannerDescription1,
                bannerDescription2:bannerInputs.bannerDescription2,
                bannerDescription3:bannerInputs.bannerDescription3,
                bannerDescription4:bannerInputs.bannerDescription4,
                category1:bannerInputs.category1,
                category2:bannerInputs.category2,
                category3:bannerInputs.category3,
                image1:bannerInputs.image1,
                image2:bannerInputs.image2,
                image3:bannerInputs.image3,
                image4:bannerInputs.image4
            }})
            .then(()=>{
                resolve()
            })
        })
    },

    //delete banner

    doDeleteBanner:(bannerId)=>{
            return new Promise(async(resolve,reject)=>{
                await db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerId)})
                .then(()=>{
                    resolve({status:true})
                })
            })
    }

}