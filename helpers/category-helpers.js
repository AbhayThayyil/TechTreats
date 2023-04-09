var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')


module.exports={
    addCategory:(category)=>{
        // console.log(category,"what is in category re body");
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
                    resolve({status:true})
                    // resolve(data.insertedId);
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

    
    getAllCategoriesOnly:()=>{
        return new Promise(async(resolve,reject)=>{
            let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    getAllCategories:(pageNumber)=>{
        return new Promise((async(resolve,reject)=>{
            try {
                const prodLimit=5;
                let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({_id:-1})
                .skip((pageNumber-1)*prodLimit).limit(prodLimit).toArray()
            // console.log(categories,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
            const totalCategories=await db.get().collection(collection.CATEGORY_COLLECTION).countDocuments();
            const totalPages=Math.ceil(totalCategories/prodLimit)

            let categoryObj={
                categories:categories,
                totalCategories:totalCategories,
                totalPages:totalPages
            }
            resolve(categoryObj)
            } catch (error) {
                console.log(error);
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
            }).then(()=>{
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