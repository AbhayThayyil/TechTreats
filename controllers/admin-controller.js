var productHelper=require('../helpers/product-helpers')
var adminHelper=require('../helpers/admin-helpers')
var userHelper=require('../helpers/user-helpers')
const categoryHelper=require('../helpers/category-helpers')
const inventoryHelper=require('../helpers/inventory-helpers')




module.exports={

    //----------------------------------------------//
    //              GET                             //
    //                                              //                    
    //----------------------------------------------//



    //admin-login
    
    adminLogin:(req,res)=>{
        if(req.session.admin){
            
            res.redirect('/admin/admin-dashboard')
        }
        else{
        
            res.render('admin/admin-login')
        }
        
    },
    adminLogout:(req,res)=>{
        req.session.admin=null
        res.redirect('/admin')
    },
    //admin-dashboard
    adminDash:(req, res, next)=> {
        
        res.render('admin/admin-dashboard',{layout:'admin-layout', admin:true,adminInSession:req.session.admin});
      },


    //admin-view-products  
    adminViewProducts:(req,res)=>{
        productHelper.getAllProducts().then((products)=>{

            // console.log("=================all products after getallproducts in viewproducts==============");
           
            res.render('admin/view-products',{layout:'admin-layout',admin:true,products,adminInSession:req.session.admin})
        })
        .catch((error)=>{
            console.log(error);
        })
      },


      //admin-add-product
    adminAddProduct:(req,res)=>{
        categoryHelper.getAllCategories().then((categories)=>{

            // console.log(categories,"============all categories check in addproduct======");
            
            res.render('admin/add-product',{layout:'admin-layout',categories,adminInSession:req.session.admin})
        }).catch((error)=>{
            console.log(error);
        })
        
      },

    //admin-edit-product
    editProduct:async(req,res)=>{
        let prodId=req.query.id
        
        // console.log(prodId);
        let product=await productHelper.getProductDetails(prodId)
        let categories=await categoryHelper.getAllCategories()

        // console.log(product);

        res.render('admin/edit-product',{layout:'admin-layout',product,categories,adminInSession:req.session.admin})
    },

    //admin-delete-product
    adminDeleteProduct:(req,res)=>{
        let prodId=req.params.id
        productHelper.deleteProduct(prodId).then((response)=>{
            res.redirect('/admin/view-products')
        }).catch((error)=>{
            console.log(error);
        })

    },
    //admin-view all users
    viewUsers:async(req,res)=>{
        await userHelper.getAllUsers().then((users)=>{

            // console.log(users,"=============to view all the users================");

            res.render('admin/view-users',{layout:'admin-layout',admin:true,users,adminInSession:req.session.admin})
        }).catch((error)=>{
            console.log(error);
        })
            
    },

    //admin-block user

    adminBlockUser:(req,res)=>{
        let userId=req.params.id
        adminHelper.blockUser(userId)

        // console.log("Blocked user");

        res.redirect('/admin/view-users')
    },

    //admin-unblock-user

    adminUnblockUser:(req,res)=>{
        let userId=req.params.id
        adminHelper.unblockUser(userId)

        // console.log("Unblocked user");

        res.redirect('/admin/view-users')
    },

    //admin-view-categories
    viewCategories:(req,res)=>{
        categoryHelper.getAllCategories().then((categories)=>{


            // console.log(categories,"=======all categories check in viewcategories======");


            res.render('admin/view-categories',{layout:'admin-layout',admin:true,categories,adminInSession:req.session.admin})
            
        }).catch((error)=>{
            console.log(error);
        })
        
      },
      

    //admin-add-category
    addCategory:(req,res)=>{
        res.render('admin/add-category',{layout:'admin-layout','catExists':req.session.catExists,adminInSession:req.session.admin})
        req.session.catExists=null
      },

    //admin-edit-category
    editCategory:async(req,res)=>{
        let catId=req.query.id
        // console.log(prodId);
        let category=await categoryHelper.getCategoryDetails(catId)

        // console.log(category);

        res.render('admin/edit-category',{layout:'admin-layout',category,adminInSession:req.session.admin})
    },

    //admin-delete-category
    deleteCategory:(req,res)=>{
        let catId=req.params.id
        categoryHelper.doDeleteCategory(catId).then((response)=>{
            res.redirect('/admin/view-categories')
        }).catch((error)=>{
            console.log(error);
        })

    },
    viewInventory:async(req,res)=>{
        await productHelper.getAllProducts().then((products)=>{
            res.render('admin/view-inventory',{layout:'admin-layout',admin:true,products,adminInSession:req.session.admin})
        })
        
        .catch((error)=>{
            console.log(error);
        })
    },

    adminViewOrders:async(req,res)=>{
        let orderDetails=await adminHelper.adminGetOrders()
        console.log(orderDetails,"check order details");
        res.render('admin/admin-view-orders',{orderDetails,adminInSession:req.session.admin},)
    },

    
    

           
          

    

    //----------------------------------------------//
    //              POST                           //
    //                                             //                    
    //--------------------------------------------//




    //post-admin-login
    postAdminLogin:(req,res)=>{

        // console.log(req.body,"checking req log body");

        adminHelper.doAdminLogIn(req.body).then((response)=>{
            // console.log(response,"response check 2");

            if(response.status){
                // console.log(response,"check response of admin");
                // req.session.loggedIn=true
                req.session.admin=response.admin
                req.session.adminLoggedIn=true
                
                // console.log(req.session,"session");
                res.redirect('/admin/admin-dashboard')
            }
            else{
                res.render('admin/admin-login',{layout:'admin-Layout','AdminLoginError':"You are not admin.Try again"})
            }
        }).catch((error)=>{
            console.log(error);
        })
    },



    //add-product-post
    postAddProduct:(req,res)=>{

        // console.log(req.body);
        // console.log(req.files);

        productHelper.addProduct(req.body,(id)=>{
            let image=req.files.image
            let image2=req.files.image2
            let image3=req.files.image3
            let image4=req.files.image4

            image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
                image2.mv('./public/product-images2/'+id+'.jpg',(err,done)=>{
                    image3.mv('./public/product-images3/'+id+'.jpg',(err,done)=>{
                        image4.mv('./public/product-images4/'+id+'.jpg',(err,done)=>{
                            
                            if(!err){
                                // res.json({response:"/admin/view-products"})
                                res.redirect('view-products')
                            }
                            else{
                                console.log(err);
                            }
                        })
                    })
                })
                
            })
            
        })
    },

    //edit-product-post

    postEditProduct:(req,res)=>{
        let id=req.params.id
        productHelper.updateProduct(req.params.id,req.body).then(()=>{

            // console.log(req.params.id);

            res.redirect('/admin/view-products')
            if(req.files.image){
                let image=req.files.image
                image.mv('./public/product-images/'+id+'.jpg')
            }
            if(req.files.image2){
                let image2=req.files.image2
                image2.mv('./public/product-images2/'+id+'.jpg')
            }
            if(req.files.image3){
                let image3=req.files.image3
                image3.mv('./public/product-images3/'+id+'.jpg')
            }
            if(req.files.image4){
                let image4=req.files.image4
                image4.mv('./public/product-images4/'+id+'.jpg')
            }
        }).catch((error)=>{
            console.log(error);
        })
    },


    

    //post-add category
    postAddCategory:(req,res)=>{
        // console.log(req.body,"what i enetered");
        
        categoryHelper.addCategory(req.body).then((response)=>{

            if(!response.status){
                
                req.session.catExists="The entered category already exists.Enter another."
                res.redirect("/admin/add-category")
            }
            // console.log(response,"===================response check of category add=============");
            else{
                res.redirect("/admin/view-categories")
            }
            
        }).catch((error)=>{

            console.log(error);
        })
        },


    postEditCategory:(req,res)=>{
        let id=req.params.id
        categoryHelper.updateCategory(req.params.id,req.body).then(()=>{

            // console.log(req.params.id);

            res.redirect('/admin/view-categories')
        }).catch((error)=>{
            console.log(error);
        })
    },
    postAddStock:(req,res)=>{
        

        inventoryHelper.doAddStock(req.body).then(()=>{
            res.redirect('/admin/view-inventory')
        })
    }


 }



 

    


