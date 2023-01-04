var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')
const categoryHelper=require('../helpers/category-helpers')
const { response } = require('express')
const {uid}=require('uid')
const couponHelpers = require('../helpers/coupon-helpers')



module.exports={

     //----------------------------------------------//
    //              GET                             //
    //                                              //                    
    //----------------------------------------------//

    //user-view-products

    viewProducts:async (req,res)=>{
        let userInSession=req.session.user
        let cartCount=null;
        if(userInSession){
            cartCount=await userHelper.getCartCount(req.session.user._id)
            productHelper.getAllProducts().then((products)=>{
                // console.log(products,"product list-logged in");
                categoryHelper.getAllCategories().then((categories)=>{
                    // console.log(categories,"show categories");
                    res.render('user/user-home',{user:true,products,userInSession,cartCount,categories})
                })
                
            })
        }
        else{
            productHelper.getAllProducts().then((products)=>{
                // console.log(products,"product list-not logged in");
                categoryHelper.getAllCategories().then((categories)=>{
                    res.render('user/user-home',{user:true,products,categories})
                })
                
            }).catch((error)=>{
                console.log(error);
            })
        }
        // console.log(userInSession,"check session user");
       
        
        
      },

      viewProductsCategoryWise:async(req,res)=>{
        let userInSession=req.session.user
        let cartCount=null;
        if(userInSession){
            let category=
            cartCount=await userHelper.getCartCount(req.session.user._id)
            productHelper.getAllProducts().then((products)=>{
                // console.log(products,"product list-logged in");
                categoryHelper.getAllCategories().then((categories)=>{
                    // console.log(categories,"show categories");
                    res.render('user/user-home',{user:true,products,userInSession,cartCount,categories})
                })
                
            }).catch((error)=>{
                console.log(error);
            })
        }
      },
    
    //user-signup
    
    userSignUp:(req,res)=>{
        let userInSession=req.session.user
        res.render('user/user-signup')
        
    },

    //user-login

    userLogin:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }
        else{
            res.render('user/user-login')
        }
        
    },

    //user-logout

    userLogout:(req,res)=>{
        req.session.user=null
        res.redirect('/')
    },

    //product-detail

    showProductDetail:(req,res)=>{
        let userInSession=req.session.user
        let prodId=req.query.id
        console.log(prodId,"checking prodid by query");
        productHelper.getSingleProduct(prodId).then((product)=>{
            // res.render('user/product-detail',{layout:'layout',userInSession,product})
            res.render('user/single-product',{layout:'layout',userInSession,product,user:true})
        })
        .catch((error)=>{
            console.log(error);
        })
    },

    //get-otp-login page

    otpLogin:(req,res)=>{
        res.render('user/otp-login')
    },


    verifyOtp:(req,res)=>{
        res.render('user/verify-otp')
    },

    //cart
    getCart:async(req,res)=>{
       
        let cartCount=await userHelper.getCartCount(req.session.user._id)
        let products=await userHelper.getCartProducts(req.session.user._id)
        let total=0
        if(products.length>0){
            total=await userHelper.getTotalAmount(req.session.user._id)
        }
        else{
            console.log("No products in cart");
        }
        
        
        // console.log(products,"===data from cart of each user===");
        //console.log(cartCount,"no of elements in cart");
        if(cartCount==0){
            console.log("Cart is empty");
            res.redirect('/')
        }
        else{
            res.render('user/cart',{userInSession:req.session.user,userInSessionId:req.session.user._id,layout:'layout',products,cartCount,total,user:true})
        }
        
        
    },

    addToCart:(req,res)=>{
        // console.log("=========calling add to cart===========");
        userHelper.doAddToCart(req.params.id,req.session.user._id).then(()=>{
            // res.json({status:true})
            res.redirect('/')
        }).catch((error)=>{
            console.log(error);
        })
    },
    //checkout page

    showCheckout:async(req,res)=>{

        let total=await userHelper.getTotalAmount(req.session.user._id)
        let address=await userHelper.getAddress(req.session.user._id)
        let coupons=await couponHelpers.doViewCoupon()
        
        
        res.render('user/checkout',{userInSession:req.session.user,layout:'layout',total,user:true,address,coupons})
        
    },
    orderSuccess:(req,res)=>{
        res.render('user/order-success',{userInSession:req.session.user})
    },

    //view-orders

    viewOrders:async(req,res)=>{
        
        let orderDetails=await userHelper.getOrders(req.session.user._id)
        console.log(orderDetails,"==========getting all order details========");
        res.render('user/view-orders',{user:true,userInSession:req.session.user,orderDetails})
    },

    viewProductCards:async(req,res)=>{
        let orderId=req.params.id
        console.log(orderId,"===order id===");
        let totalOrderDetails=await userHelper.getProducts(orderId)
        let totalPaid=totalOrderDetails[0].totalPrice
        let userName=totalOrderDetails[0].userName
        // console.log(totalPaid,"total paid check");
         console.log(totalOrderDetails,"what is in cards prod details");
        //  console.log(userName);
        
        
        // console.log(total,"total check");

        
        
        
        res.render('user/view-product-cards',{user:true,userInSession:req.session.user,totalOrderDetails,totalPaid,userName})
    },

    viewCategoryProducts:async(req,res)=>{
        let categoryName=req.query.name
        console.log(categoryName,"catname");
        let userInSession=req.session.user
        let cartCount=null;
        if(userInSession){
            cartCount=await userHelper.getCartCount(req.session.user._id)
            productHelper.getAllProductsWithCategory(categoryName).then((products)=>{
                categoryHelper.getAllCategories().then((categories)=>{
                    // console.log(categories,"show categories");
                    res.render('user/user-category-home',{user:true,products,userInSession,cartCount,categories})
                })
                
            }).catch((error)=>{
                console.log(error);
            })
        }
        else{
            productHelper.getAllProductsWithCategory(categoryName).then((products)=>{
                // console.log(products,"product list-not logged in");
                categoryHelper.getAllCategories().then((categories)=>{
                    res.render('user/user-home',{user:true,products,categories})
                })
                
            }).catch((error)=>{
                console.log(error);
            })
        }

    },

    userProfile:(req,res)=>{
        let userInSession=req.session.user
        
        userHelper.getAddress(userInSession._id).then((address)=>{
            
            res.render('user/user-profile',{user:true,userInSession,address})
        }).catch((error)=>{
            console.log(error);
        })
        
    },
    //show coupons

    


    //----------------------------------------------//
    //              POST                           //
    //                                             //                    
    //--------------------------------------------//

    //post user-signup

    postUserSignUp:(req,res)=>{
        // console.log(req.body)
            let address=[]
            req.body.address=address
        userHelper.doSignUp(req.body).then((response)=>{
            
            // console.log(req.body,"sign up body");
            //console.log(response,"what is returned from helper");
            // console.log(response,"response check 2");
            req.session.user=response
            req.session.userLoggedIn=true  
           // console.log(req.session,"whats in req session");
             
            
            if(response.status){
                res.redirect('/')
            }
            else{
                res.render('user/user-signup',{'signupError':"User already registered with this email address/mobile number.Please use another"})
            }
            
        }).catch((error)=>{
            console.log(error);
        })
        
    },

    //post user-login
    
    postUserLogin:(req,res)=>{
        userHelper.doLogIn(req.body).then((response)=>{
            
            // console.log(response,"response check 2");

            if(response.status){
                if(response.user.block){

                    res.render('user/user-login',{'blockError':"You have been blocked.Please contact Admin"})
                }
                else{
                    req.session.user=response.user
                    req.session.userLoggedIn=true
                    
                    
                    // console.log(req.session,"session");
                    res.redirect('/')
                }
            }
            else{
                res.render('user/user-login',{'loginError':"Invalid credentials.Please enter again"})
            }
        }).catch((error)=>{
            console.log(error);
        })
    },

    let:signupData=0,
    postOtpLogin:(req,res)=>{
    
        // console.log(req.body,"what we enter when we enter number");
        userHelper.doOtpLogin(req.body).then((response)=>{
            if(response.status){
                signupData=response.user;
                // console.log(signupData,"======signupdata=======");
                res.redirect('/verify-otp')
            }
            else{
                res.redirect('/otp-login')
            }
        }).catch((error)=>{
            console.log(error);
        })
        console.log(req.body,"chekcing body we enter");
    },
    
    postVerifyOtp:(req,res)=>{
        
        console.log(req.body,"===the otp we enter====");
        userHelper.doVerifyOtp(req.body,signupData).then((response)=>{
            if(response.status){
                req.session.userLoggedIn=true;
                req.session.user=signupData;

                res.redirect('/')
            }
            else{
                res.redirect('/verify-otp')
            }
        }).catch((error)=>{
            console.log(error);
        })
    },

    changeProductQuantity:(req,res,next)=>{
        console.log(req.body,"change product quantity");
        userHelper.doChangeproductQuantity(req.body).then(async(response)=>{
            response.total=await userHelper.getTotalAmount(req.body.user)
            res.json(response)
            console.log(response,"change prod quantity controller");
        }).catch((error)=>{
            console.log(error);
        })
    },

    removeTheCartItem:(req,res,next)=>{
        // console.log(req.body,"what comes in remove item controller");
        userHelper.doRemoveCartItem(req.body).then((response)=>{
            res.json(response)
        }).catch((error)=>{
            console.log(error);
        })
    },

    //checkout post

    postCheckout:async(req,res)=>{
        // console.log(req.body,"checking postcheckout body");
        req.body.userName=req.session.user.name   //adding user details to req.body
        console.log(req.body,"req.body check");
        let products=await userHelper.getCartProductList(req.body.userId)
        console.log(products,"products check");
        let totalPrice=await userHelper.getTotalAmount(req.body.userId)
        
        let address=await userHelper.getUniqueAddress(req.body.userId,req.body.addressId)
        console.log(address,"what is in address in postcheckout");
        req.body.address=address
        userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
        //    console.log(req.session.user,"user login details");
            console.log(req.body,"===checking what is in post checkout===");
           
            if(req.body['payment-method']==='COD'){
                res.json({codSuccess:true,products})
                console.log(response);
                
            }
            else{
                userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
                    // console.log(response,"==checking generate razorpay response,resolve from new order==");
                    res.json(response)
                }).catch((error)=>{
                    console.log(error);
                })
            }
            }).catch((error)=>{
                console.log(error);
            })
        
    },

    doVerifyPayment:(req,res)=>{
        console.log(req.body,"===do verify payment===");
        userHelper.paymentVerification(req.body).then(()=>{
            userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
                console.log("Payment successful");
                res.json({status:true})
            })
        }).catch((err)=>{
            console.log(err);
            res.json({status:false,errMsg:'Payment Failed'})
        })
    },

    //add address
    addAddress:async(req,res)=>{
        let addressid=uid()
        req.body.addressid=addressid
        // console.log(req.body,"what is here");
        await userHelper.doAddAddress(req.body).then(()=>{
            res.redirect('/user-profile')
        }).catch((error)=>{
            console.log(error);
        })

    },
    deleteAddresses:(req,res)=>{
        console.log("ajax check");
          userHelper.doDeleteAddress(req.body).then((response)=>{
            res.json(response)
        }).catch((error)=>{
            console.log(error);
        })
    },

    //submit coupon

    submitCoupon:(req,res)=>{
        console.log(req.body,"=======coupon data========");
        couponHelpers.isCoupon(req.body.coupon).then((response)=>{
            console.log(response);
            res.json(response)
        }).catch((response)=>{
            console.log("coupon invalid");
            res.json(response)
        })        
    },

    //reduce stock quantity
    stockReduce:(req,res)=>{
        console.log(req.body,"what is passed from ajax");
        userHelper.decreaseStock(req.body.products).then(()=>{

        }).catch((error)=>{
            console.log(error);
        })
    },

    cancelOrder:(req,res)=>{
        console.log(req.body,"what is passed from ajax");

        if(req.body.cancelStatus=='Cancelled'){
            console.log(req.body.quantity,"how much to cancel");
            userHelper.cancelCODOrder(req.body.orderId,req.body.productId,req.body.quantity,req.body.cancelStatus)
            .then((response)=>{
                res.json(response)
            }).catch(()=>{
                console.log("Something went wrong");
            })
        }
        else if (req.body.cancelStatus=='Cancel Requested'){
            console.log('Cancel Requested');
            userHelper.cancelOrder(req.body.orderId,req.body.productId,req.body.quantity,req.body.cancelStatus)
        }

    },

    orderReturn:(req,res)=>{
        // console.log(req.body,"what is in order return body");
        userHelper.doReturnOrder(req.body.orderId,req.body.productId,req.body.returnStatus).then((response)=>{
            res.json(response)
        })
    }

    

}
