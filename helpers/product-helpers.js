var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectId


module.exports={
    addProduct:(product,callback)=>{
        // console.log(product);
        // console.log(product,"====add product=======");
        product.stock=parseInt( product.stock)
        product.price=parseInt(product.price)
        console.log(product.price);
        try {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                callback(data.insertedId)
                // console.log(data.insertedId);
                
               
            })
        } catch (error) {
            let err={}
            err.message="cannot add product"
            reject(err)
        }
        
    },
    
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()
            // console.log(products,"=====================products stored in products variable after getting it from DB=========");
            resolve(products)
            } catch (error) {
                let err={}
                err.message="cannot get all products"
                reject(err)
            }
            
            
        })
    },


    getProductDetails:(prodId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((product)=>{
                    resolve(product)
                })
            } catch (error) {
                let err={}
                err.message="Unable to access product detail"
                reject(err)
            }
           
        })
    },

    deleteProduct:(prodId)=>{
        // console.log(prodId,"prod ID check");
        return new Promise(async (resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                let err={}
                err.message="Unable to delete product "
                reject(err)
            }
            
        })
    },

    updateProduct:(prodId,prodDetails)=>{
        prodDetails.stock=parseInt(prodDetails.stock)
        prodDetails.price=parseInt(prodDetails.price)
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(prodId)},{
                $set:{
                    name:prodDetails.name,
                    category:prodDetails.category,
                    price:prodDetails.price,
                    description:prodDetails.description,
                    stock:prodDetails.stock
                }
            }).then((response)=>{
                resolve()
            })
            } catch (error) {
                let err={}
                err.message="Unable to update product "
                reject(err)
            }
            
        })
    },

    
    getSingleProduct:(prodId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try {
                let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)})
            resolve(product)
            } catch (error) {
                let err={}
                err.message="Unable to access single product "
                reject(err)
            }
            
        })
    }
}
