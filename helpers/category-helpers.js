var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')


module.exports={
    addCategory:(category)=>{
        //category name converted to uppercase
        category.name=category.name.toUpperCase();
        // console.log(category.name,"================category name UC============");
        // console.log(category,"what is in add category function");
        return new Promise(async(resolve,reject)=>{
            try {
                const categoryData=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({name:category.name})
            
            if(categoryData){
                // console.log(categoryData,"====================all category data of this==========");
                console.log("Entered category exists");
                resolve({status:false})
            }
            else{
                
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
                    console.log(data);
                    resolve(data.insertedId);
            })
            }
            } catch (error) {
                let err={}
                err.message="Error in adding category"
                reject(err)
            }    
        })
    },

    //add to set test

    

    getAllCategories:()=>{
        return new Promise((async(resolve,reject)=>{
            try {
                let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            // console.log(categories,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
            resolve(categories)
            } catch (error) {
                let err={}
                err.message="Cannot get all category data"
                reject(err)
            }
            
            

        }))
    },

    getCategoryDetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(catId)}).then((category)=>{
                    resolve(category)
                })
            }catch (error) {
                let err={}
                err.message="Cannot get specific category detail"
                reject(err)
            }
            } 
            )
    },

    doDeleteCategory:(catId)=>{
        // console.log(catId,"cat ID check");
        return new Promise(async (resolve,reject)=>{
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(catId)}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                let err={}
                err.message="Delete the category"
                reject(err)
            }
            
        })
    },

    updateCategory:(catId,catDetails)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:ObjectId(catId)},{
                $set:{
                    name:catDetails.name.toUpperCase(),
                    description:catDetails.description
                }
            }).then((response)=>{
                resolve()
            })
            } catch (error) {
                let err={}
                err.message="Unable to update category"
                reject(err)
            }
            
            
        })
    }
}