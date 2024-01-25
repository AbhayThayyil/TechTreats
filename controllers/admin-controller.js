var productHelper=require('../helpers/product-helpers')
var adminHelper=require('../helpers/admin-helpers')
var userHelper=require('../helpers/user-helpers')
const categoryHelper=require('../helpers/category-helpers')
const inventoryHelper=require('../helpers/inventory-helpers')
const couponHelper=require('../helpers/coupon-helpers')
const bannerHelper=require('../helpers/banner-helpers')
const chartHelper=require('../helpers/chart-helpers')



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
    adminDash:async(req, res)=> {
        if(req.session.admin){
            let totalSales=await chartHelper.getTotalSales()
            let totalRevenue=await chartHelper.getTotalRevenue()
            let totalCustomers=await chartHelper.getTotalUsers()
            let monthlyGraph=await chartHelper.getMonthlyGraph()
            let salesReport=await chartHelper.getSalesReport()
            let weeklyGraph=await chartHelper.getWeeklyGraph()
            let recentSales=await chartHelper.getRecentSales()

            res.render('admin/admin-dashboard',{layout:'admin-layout', admin:true,adminInSession:req.session.admin,totalSales,totalRevenue,totalCustomers,monthlyGraph,salesReport,weeklyGraph,recentSales});
        }
        
        
      },


    //admin-view-products  
    adminViewProducts:(req,res)=>{
        let pageNumber=1;
        if(req.query.page){
            pageNumber=req.query.page
        }
        productHelper.getAllProducts(pageNumber).then((products)=>{
            let images=products.image
            // console.log(products,"prodobj plss");
           
            // console.log("=================all products after getallproducts in viewproducts==============");
           
            res.render('admin/view-products',{layout:'admin-layout',admin:true,products:products.products,
            adminInSession:req.session.admin,images,totalPages:products.totalPgs,pageNumber:products.pageNo,
            next:parseInt(pageNumber)+1,previous:parseInt(pageNumber)-1})
        })
        .catch((error)=>{
            console.log(error);
        })
      },


      //admin-add-product
    adminAddProduct:(req,res)=>{
        categoryHelper.getAllCategoriesOnly().then((categories)=>{

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
        let categories=await categoryHelper.getAllCategoriesOnly()

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

        let pageNumber=1
        if(req.query.page){
            pageNumber=req.query.page
        }
        await userHelper.getAllUsers(pageNumber).then((users)=>{

            // console.log(users,"=============to view all the users================");

            res.render('admin/view-users',{layout:'admin-layout',admin:true,users:users.users,adminInSession:req.session.admin,
            totalPages:users.totalPages,pageNumber,next:parseInt(pageNumber)+1,previous:parseInt(pageNumber)-1})
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
        let pageNumber=1
        if(req.query.page){
            pageNumber=req.query.page
        }
        categoryHelper.getAllCategories(pageNumber).then((categories)=>{


            // console.log(categories,"=======all categories check in viewcategories======");


            res.render('admin/view-categories',{layout:'admin-layout',admin:true,categories,adminInSession:req.session.admin,
            categories:categories.categories,totalPages:categories.totalPages,pageNumber,
            next:parseInt(pageNumber)+1,previous:parseInt(pageNumber)-1})
            
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
        let pageNumber=1
        if(req.query.page){
            pageNumber=req.query.page
        }

        let orderDetails=await adminHelper.adminGetOrders(pageNumber)
        
        // console.log(orderDetails,"check order details");
        res.render('admin/admin-view-orders',{orderDetails:orderDetails.orderDetails,adminInSession:req.session.admin,admin:true,
            adminInSession:req.session.admin,layout:'admin-layout',
            totalPages:orderDetails.totalPages,pageNumber,next:parseInt(pageNumber)+1,previous:parseInt(pageNumber)-1})
    },

    viewAdminProductCards:async(req,res)=>{
        let orderId=req.query.id
        // console.log(orderId,"===order id===");
        let totalOrderDetails=await userHelper.getProducts(orderId)
        let totalPaid=totalOrderDetails[0].totalPrice
        // console.log(totalOrderDetails,"total order details");

        res.render('admin/admin-order-cards',{admin:true,adminInSession:req.session.admin,totalOrderDetails,totalPaid})
    },
    //add-coupon-get
    addCoupon:(req,res)=>{
        res.render('admin/add-coupon',{admin:true,layout:'admin-layout',adminInSession:req.session.admin})
    },

    //view coupon-coupon management
    viewCoupon:async(req,res)=>{
        let pageNumber=1
        if(req.query.page){
            pageNumber=req.query.page
        }
        let coupon=await couponHelper.doViewCoupon(pageNumber)
        // console.log(coupon,"coupon");
        res.render('admin/coupon-management',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,
        coupon:coupon.coupon,totalPages:coupon.totalPages,pageNumber,next:parseInt(pageNumber)+1,previous:parseInt(pageNumber)-1})
    },
    
    //edit coupon get

    editCoupon:async(req,res)=>{
        let couponId=req.query.id
        let couponData=await couponHelper.getCouponData(couponId)
        res.render('admin/edit-coupon',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,couponData})
    },

    //delete coupon get
    deleteCoupon:(req,res)=>{
        let couponId=req.query.id
        couponHelper.doDeleteCoupon(couponId).then(()=>{
            res.redirect('/admin/view-coupons')
        })

    },

    //**********************************BANNER **************** */

    viewBanner:(req,res)=>{
        let pageNumber=1
        if(req.query.page){
            pageNumber=req.query.page
        }
        
        bannerHelper.getBanners(pageNumber).then((bannerData)=>{
            // console.log(bannerData,"this is the banner details");
            res.render('admin/banner-management',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,
            bannerData:bannerData.bannerData,totalPages:bannerData.totalPages,
            pageNumber,next:parseInt(pageNumber)+1,previous:parseInt(pageNumber)-1})
        })
    },


    //add banner-get (to show the form to add banner)
    addBanner:(req,res)=>{
        categoryHelper.getAllCategoriesOnly().then((categories)=>{
            res.render('admin/add-banner',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,categories})

        })
    },

    //edit existing banner
    editBanner:(req,res)=>{
        let bannerId=req.query.id
        bannerHelper.getBannerDetails(bannerId).then((bannerDetails)=>{
            // console.log(bannerDetails,"these are banner details in get edit banner");
            categoryHelper.getAllCategoriesOnly().then((categories)=>{
                res.render('admin/edit-banner',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,bannerDetails,categories})

            })
        })
    },

    //delete existing banner

    deleteBanner:(req,res)=>{
        let bannerId=req.params.id
        bannerHelper.doDeleteBanner(bannerId).then(()=>{
            res.redirect('/admin/banner-management')
        })
    },

    //to get sales report
    salesReport:async(req,res)=>{
        let salesData=await chartHelper.getSalesReport()
        // console.log(salesData,"what is sales data in controller");
        
        
        res.render('admin/sales-report',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,salesData})
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

        
        // console.log(req.files);
        let image=[]
            req.files.forEach((value,index)=>{
                image.push(value.filename)
            })
            req.body.image=image
            
            //  console.log(req.body);

        productHelper.addProduct(req.body,(id)=>{
            
                // res.json({response:"/admin/view-products"})
                res.redirect('view-products')

            

            // let image=req.files.image
            // let image2=req.files.image2
            // let image3=req.files.image3
            // let image4=req.files.image4

            // image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
            //     image2.mv('./public/product-images2/'+id+'.jpg',(err,done)=>{
            //         image3.mv('./public/product-images3/'+id+'.jpg',(err,done)=>{
            //             image4.mv('./public/product-images4/'+id+'.jpg',(err,done)=>{
                            
                            
            //             })
            //         })
            //     })
                
            // })
            
        })
    },

    //edit-product-post

    postEditProduct:(req,res)=>{
        let id=req.params.id
        let image=[]
        req.files.forEach((value,index)=>{
            image.push(value.filename)
        })
        req.body.image=image
        // console.log(req.body,"req.body in posteditprod");
        productHelper.updateProduct(req.params.id,req.body).then(()=>{

            // console.log(req.params.id);

            res.redirect('/admin/view-products')
            
        }).catch((error)=>{
            console.log(error);
        })
    },


    

    //post-add category
    postAddCategory:(req,res)=>{
        //  console.log(req.body,"what i enetered");
        
        categoryHelper.addCategory(req.body).then((response)=>{

            // console.log(response,"response check in controller");
            if(response.status){
                res.redirect("/admin/view-categories")
            }
            // console.log(response,"===================response check of category add=============");
            else{
                req.session.catExists="The entered category already exists.Enter another."
                res.redirect("/admin/add-category")
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
    },
    //update order status

    updateStatus:(req,res)=>{
        // console.log("is it working");
        productHelper.changeOrderStatus(req.body).then((response)=>{
            // console.log(response,"change order status");
            res.json(response)
        })
    },
    //add coupon post
    postAddCoupon:(req,res)=>{
        // console.log(req.body,"what is in coupon body");
        req.body.couponName=req.body.couponName.toUpperCase()
        req.body.discountPercent=parseInt(req.body.discountPercent)
        req.body.validFrom=new Date(req.body.validFrom)
        req.body.validTill=new Date(req.body.validTill)
        req.body.minAmount=parseInt(req.body.minAmount)
        req.body.maxAmount=parseInt(req.body.maxAmount)
        req.body.maxUses=parseInt(req.body.maxUses)
        req.body.usedBy=[]
        
        if(req.body.validFrom > req.body.validTill){
            
        }
        couponHelper.doAddCoupon(req.body).then(()=>{
            res.redirect('/admin/view-coupons')
        })
    },

    //post edit coupon
    postEditCoupon:(req,res)=>{

        let couponId=req.query.id
        req.body.couponvalue=parseInt(req.body.couponvalue)
        req.body.couponStartDate=new Date(req.body.couponStartDate)
        req.body.couponEndDate=new Date(req.body.couponEndDate)
        req.body.minAmount=parseInt(req.body.minAmount)
        req.body.maxAmount=parseInt(req.body.maxAmount)
        req.body.usageLimit=parseInt(req.body.usageLimit)
        req.body.usageLimitUser=parseInt(req.body.usageLimitUser)
        req.body.noOfItems=parseInt(req.body.noOfItems)

        couponHelper.doEditCoupon(couponId,req.body).then(()=>{
            res.redirect('/admin/view-coupons')
        })
    },

    sendRefundProcess:(req,res)=>{
        // console.log(req.body,"refund body");

    },
    //**********************************BANNER **************** */
    
    
    
    
    //post add banner to post the form with banner data
    postAddBanner:(req,res)=>{

        req.body.image1=req.files.bannerImage1[0].filename
        req.body.image2=req.files.bannerImage2[0].filename
        req.body.image3=req.files.bannerImage3[0].filename
        req.body.image4=req.files.bannerImage4[0].filename
        

        
        // console.log(req.files);
        // console.log(req.body,"what is being added in the banner");

        bannerHelper.doAddBanner(req.body)
        res.redirect('/admin/banner-management')

    },

    //post edit banner to edit a selected banner

    postEditBanner:(req,res)=>{
        let bannerId=req.query.id
        // console.log(bannerId);
        // console.log(req.files,"this is files");
        // console.log(req.body,"this is body");
        req.body.image1=req.files.bannerImage1[0].filename
        req.body.image2=req.files.bannerImage2[0].filename
        req.body.image3=req.files.bannerImage3[0].filename
        req.body.image4=req.files.bannerImage4[0].filename
        

        bannerHelper.updateBanner(bannerId,req.body).then(()=>{
            res.redirect('/admin/banner-management')
        })
    },

    sortSales:(req,res)=>{
        // console.log(req.body,"What is passed in sortSales");
        chartHelper.getFilteredReport(req.body.fromDate,req.body.toDate).then((filteredSalesReport)=>{
            res.render('admin/filtered-sales-report',{admin:true,layout:'admin-layout',adminInSession:req.session.admin,filteredSalesReport}) 
        })

    }

    


 }



 

    


