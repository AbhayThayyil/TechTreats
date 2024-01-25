var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectId

module.exports={
    getAllInventory:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let inventory=db.get().collection(collection.INVENTORY_COLLECTION).find().toArray()
                let products=db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                // console.log(inventory."inventory");
                // console.log(products,"products");
                resolve(inventory)
                resolve(products)
            } catch (error) {
                let err={}
                err.message="Cannot get inventory"
                reject(err)
            }
            
        })
    },

    doAddStock:(data)=>{
        // console.log(catId,"cat ID check");
        
        data.newStock=parseInt(data.newStock)
        // console.log(data,"=================add stock======");
        return new Promise(async (resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(data.id)}
                ,{
                    $inc:{
                        stock:data.newStock
                    }
                }).then((response)=>{
                    // console.log(response,"=================add stock response ======");
                    resolve()
                })
            } catch (error) {
                let err={}
                err.message="Delete the category"
                reject(err)
            }
            
        })
    }
}
