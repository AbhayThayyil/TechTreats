var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')
const categoryHelper=require('../helpers/category-helpers')
const { response } = require('express')
const {uid}=require('uid')
const couponHelpers = require('../helpers/coupon-helpers')
const bannerHelper=require('../helpers/banner-helpers')
const chartHelper=require('../helpers/chart-helpers')
const otpHelper=require('../helpers/otp-helpers')
const { Error } = require('mongoose')

const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:process.env.CLIENT_ID,
    client_secret:process.env.CLIENT_SECRET
  });




module.exports={

     //----------------------------------------------//
    //              GET                             //
    //                                              //                    
    //----------------------------------------------//

    //user-view-products

    viewProducts:async (req,res)=>{

        //search start
        let search='';
        if(req.query.search){
            search=req.query.search
        }
        console.log(search);
        //search end


        let userInSession=req.session.user
        let cartCount=null;
        if(userInSession){
            cartCount=await userHelper.getCartCount(req.session.user._id)
            productHelper.getAllProductsOnly().then((products)=>{
                // console.log(products,"product list-logged in");

                //search trial start
                const filteredProducts=products.filter(product=>{
                    return product.name.toLowerCase().includes(search.toLowerCase())
                })
                console.log(filteredProducts,"============These will be the filtered products");
                //search trial end


                categoryHelper.getAllCategoriesOnly().then((categories)=>{
                    // console.log(categories,"show categories");
                    bannerHelper.getBannersOnly().then((bannerData)=>{
                        // console.log(bannerData,"================bannerdata in user controller============");
                        res.render('user/user-home',{user:true,products,userInSession,cartCount,categories,bannerData,filteredProducts})
                    })
                    
                })
                
            })
        }
        else{
            productHelper.getAllProductsOnly().then((products)=>{
                console.log(products,"product list-not logged in");


                //search trial start
                const filteredProducts=products.filter(product=>{
                    return product.name.toLowerCase().includes(search.toLowerCase())
                })
                console.log(filteredProducts,"============These will be the filtered products");

                //search trial end

                categoryHelper.getAllCategoriesOnly().then((categories)=>{
                    bannerHelper.getBannersOnly().then((bannerData)=>{
                        // console.log(bannerData,"================bannerdata in user controller============");

                        res.render('user/user-home',{user:true,products,categories,bannerData,filteredProducts})
                    })
                })
                
            }).catch((error)=>{
                console.log(error);
                res.render('user/404')
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
                categoryHelper.getAllCategoriesOnly().then((categories)=>{
                    // console.log(categories,"show categories");
                    res.render('user/user-home',{user:true,products,userInSession,cartCount,categories})
                })
                
            }).catch((error)=>{
                console.log(error);
                res.render('user/404')
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
        //console.log(prodId,"checking prodid by query");
        productHelper.getSingleProduct(prodId).then((product)=>{
            //console.log(product,"What is to be displayed");
            if(product.reviewData){
                product.reviewData.sort((a,b)=>{
                    return b.date - a.date
                })

                function generateStarRating(rating){
                    const fullStarCount = Math.floor(rating);
                    const halfStarCount = Math.ceil(rating - fullStarCount);
                    const emptyStarCount = 5 - fullStarCount - halfStarCount;
                    let html = "";
                    for (let i = 0; i < fullStarCount; i++) {
                      html += '<i class="fa fa-star"></i>';
                    }
                    for (let i = 0; i < halfStarCount; i++) {
                      html += '<i class="fa fa-star-half"></i>';
                    }
                    for (let i = 0; i < emptyStarCount; i++) {
                      html += '<i class="fa fa-star-o"></i>';
                    }
                    return html;
                  }

                product.reviewData.forEach((product) => {
                    const options = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      };
                      const humanReadableDate = product.date.toLocaleDateString(
                        "en-US",
                        options
                      );
                      // console.log(humanReadableDate);
                      product.date = humanReadableDate;
                    
                      // Star rating 
                    const starRating=generateStarRating(product.reviewRating)
                    product.reviewRating=starRating    
                });

                
                console.log(product.reviewData,"sorted review?");
            // res.render('user/product-detail',{layout:'layout',userInSession,product})
            res.render('user/single-product',{layout:'layout',userInSession,product,user:true,reviewData:product.reviewData})
            }
            else{
                res.render('user/single-product',{layout:'layout',userInSession,product,user:true})
            }
           
            
        })
        .catch((error)=>{
            console.log(error);
            res.render('user/404')
        })
    },

    // To submit a product review
    submitReview:(req,res)=>{
         console.log(req.body,"what is the review");
        // console.log(req.session.user._id,"user id");
        // console.log(req.body.prodId,"product id");
        if(!req.session.user){
            res.redirect("/user-login")
        }
        
        productHelper.storeReview(req.body,req.session.user._id,req.body.prodId).then((response)=>{
            //console.log("Review submitted");
            res.json(response)
            // res.redirect('/product-detail?id='+req.body.prodId)
           
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
            res.render('user/404')
        })
    },
    //checkout page

    showCheckout:async(req,res)=>{

        let total=await userHelper.getTotalAmount(req.session.user._id)
        let address=await userHelper.getAddress(req.session.user._id)
        let coupons=await couponHelpers.doViewCouponOnly()
        
        
        res.render('user/checkout',{userInSession:req.session.user,layout:'layout',total,user:true,address,coupons})
        
    },
    orderSuccess:(req,res)=>{
        res.render('user/order-success',{userInSession:req.session.user})
    },

    orderFail:(req,res)=>{
        userHelper.removePendingStatus().then(()=>{
            res.render('user/order-cancel',{userInSession:req.session.user})
        })
    },

    // To select address from dropdown list

    getAddressFromDropdown:(req,res)=>{
        let addressId=req.params.id
        userHelper.getUniqueAddress(req.session.user._id,addressId).then((selectedAddress)=>{
            console.log(selectedAddress,"===This is the selected address===");
            res.json(selectedAddress)
        })
    },

    //view-orders

    viewOrders:async(req,res)=>{
        
        let orderDetails=await userHelper.getOrders(req.session.user._id)
        //console.log(orderDetails,"==========getting all order details========");
        res.render('user/view-orders',{user:true,userInSession:req.session.user,orderDetails})
    },

    viewProductCards:async(req,res)=>{
        let orderId=req.params.id
        console.log(orderId,"===order id===");
        let totalOrderDetails=await userHelper.getProducts(orderId)
        
        let totalPaid=totalOrderDetails[0].totalPrice
        let userName=totalOrderDetails[0].userName
        
        let discountAmount=totalOrderDetails[0].discountPrice
        let finalAmount=totalOrderDetails[0].finalPrice
        // console.log(totalPaid,"total paid check");
         console.log(totalOrderDetails,"what is in cards prod details");
        //  console.log(userName);
        
        
        // console.log(total,"total check");

        
        
        
        res.render('user/view-product-cards',{user:true,userInSession:req.session.user,totalOrderDetails,totalPaid,
            discountAmount,finalAmount,userName,date:totalOrderDetails[0].date})
    },

    viewCategoryProducts:async(req,res)=>{

        //search start
        var search='';
        if(req.query.search){
            search=req.query.search
        }
        // console.log(search);
        //search end

        let categoryName=req.query.name
        console.log(categoryName,"catname");
        let userInSession=req.session.user
        let cartCount=null;
        if(userInSession){
            cartCount=await userHelper.getCartCount(req.session.user._id)
            productHelper.getAllProductsWithCategory(categoryName).then((products)=>{

                //search trial start
                const filteredProducts=products.filter(product=>{
                    return product.name.toLowerCase().includes(search.toLowerCase())
                })
                console.log(filteredProducts,"============These will be the filtered products");
                //search trial end

                categoryHelper.getAllCategoriesOnly().then((categories)=>{
                    // console.log(categories,"show categories");
                    bannerHelper.getBannersOnly().then((bannerData)=>{
                        console.log(bannerData);
                        res.render('user/user-category-home',{user:true,products,userInSession,cartCount,categories,bannerData,filteredProducts})
                    })
                    
                })
                
            }).catch((error)=>{
                console.log(error);
                res.render('user/404')
            })
        }
        else{
            productHelper.getAllProductsWithCategory(categoryName).then((products)=>{
                // console.log(products,"product list-not logged in");

                //search trial start
                const filteredProducts=products.filter(product=>{
                    return product.name.toLowerCase().includes(search.toLowerCase())
                })
                console.log(filteredProducts,"============These will be the filtered products");
                //search trial end
                
                categoryHelper.getAllCategoriesOnly().then((categories)=>{
                    bannerHelper.getBannersOnly().then((bannerData)=>{
                        res.render('user/user-home',{user:true,products,categories,bannerData,filteredProducts})
                    })
                })
                
            }).catch((error)=>{
                console.log(error);
                res.render('user/404')
            })
        }

    },

    userProfile:(req,res)=>{
        let userInSession=req.session.user
        
        userHelper.getAddress(userInSession._id).then((address)=>{
            userHelper.showOrdersInprofile(userInSession._id).then((orders)=>{
                
                //console.log(orders,"orders to user profile");
                res.render('user/user-profile',{user:true,userInSession,address,orders})
            })
            
        }).catch((error)=>{
            console.log(error);
            res.render('user/404')
        })
        
    },

    // To edit user Credentials
    editUserCredentials:(req,res)=>{
        let userInSession=req.session.user
        userHelper.getUserData(userInSession._id).then((userData)=>{
            res.render('user/edit-credentials',{layout:'layout',userInSession,user:true,userData})
        })
    },
    // To edit basic Creds
    editBasicCreds:(req,res)=>{
        let userInSession=req.session.user
        userHelper.getUserData(userInSession._id).then((userData)=>{
            res.render('user/edit-basic-credentials',{userData})
        })   
    },
    // To edit important Creds
    editImportantCreds:(req,res)=>{
        let userInSession=req.session.user
        userHelper.getUserData(userInSession._id).then((userData)=>{
            res.render('user/edit-important-credential',{userData,'passwordUnmatchedError':"The passwords do not match"})
        })
    },

    //show wallet

    showWallet:(req,res)=>{
        let userId=req.session.user._id
        let balance=0
        userHelper.walletOperations(userId).then((walletData)=>{
            for (let i = 0; i < walletData.length; i++) {
                 balance=balance+walletData[i].totalPrice
            }
            walletData.balance=balance
            // console.log(walletData);
            res.render('user/wallet',{user:true,userInSession:req.session.user,walletData})
        })
    },

    
    


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
            // req.session.user=response
            // req.session.userLoggedIn=true  
           // console.log(req.session,"whats in req session");
             
            
            if(response.status){
                res.redirect('/user-login')
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
        otpHelper.doOtpLogin(req.body).then((response)=>{
            console.log(response,"=========what is repsosne=======");
            if(response.status){
                signupData=response.user;
                console.log(signupData,"======signupdata=======");
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
        
            console.log(signupData,"===================sign up data============");
        otpHelper.doVerifyOtp(req.body,signupData).then((response)=>{
            console.log(response,"=================response=================");
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
        console.log(req.body,"checking postcheckout body");
        req.body.userName=req.session.user.name   //adding user details to req.body
        console.log(req.body,"req.body check");
        let products=await userHelper.getCartProductList(req.body.userId)
        console.log(products,"products check");
        let totalPrice=await userHelper.getTotalAmount(req.body.userId)
        
        //let address=await userHelper.getUniqueAddress(req.body.userId,req.body.addressId)
       // console.log(address,"what is in address in postcheckout");
        let subTotal=parseInt(req.body.subTotal)
        let discountAmount=parseInt(req.body.discountAmount)
        let finalPrice=parseInt(req.body.finalPrice)

        console.log(req.body,"=============new check==========");
        if(req.body.coupon){
            couponHelpers.updateCouponStatus(req.body.coupon,req.body.userId).then(()=>{
                console.log("Coupon DB updated");
            })
        }
        userHelper.placeOrder(req.body,products,subTotal,discountAmount,finalPrice).then(async(orderId)=>{
        //    console.log(req.session.user,"user login details");
            console.log(req.body,"===checking what is in post checkout===");
            
           
            if(req.body['payment-method']==='COD'){
                res.json({codSuccess:true,products})
                console.log(response,"====response after COD order completed====");
                
            }
            else if(req.body['payment-method']==='RazorPay'){
                userHelper.generateRazorpay(orderId,finalPrice).then((response)=>{
                    // console.log(response,"==checking generate razorpay response,resolve from new order==");
                    res.json(response)
                }).catch((error)=>{
                    console.log(error);
                })
            }
            else if(req.body['payment-method']==='PayPal'){
                console.log(finalPrice,products,"////checking paypal parameters////");
                // Creating payment object for paypal
                const payment={
                    intent: "sale",
                    payer: {
                        payment_method: "paypal",
                    },
                    redirect_urls: {
                    return_url: "http://localhost:3000/paypal-order-success/"+orderId,
                    cancel_url: "http://localhost:3000/order-fail",
                     },
                    transactions: [
                     {
                        amount: {
                        currency: "USD",
                        total: Math.floor(finalPrice * 0.012),
                    },
                    description: "Best products from Tech Treats",
                    },
                    ],
                }

                // Helper
                userHelper.createPaypalOrder(payment).then((transaction)=>{
                    // console.log(transaction,"CHEKING THE RESOLVE FROM CREATE PAYPAL ORDER");

                    let transId=transaction.id;
                    let links=transaction.links;
                    let count=links.length;
                    for (let i = 0; i < count; i++) {
                        if (links[i].rel === "approval_url") {
                          transaction.pay=true;
                          transaction.linkto=links[i].href
                          transaction.orderId=orderId
                          transaction.paypalSuccess=true

                          res.json(transaction)
                        }
                      }
                }).catch((error)=>{
                    console.log(error);
                })
            }
            })
        
    },

    // Paypal order success
    paypalSuccess:async(req,res)=>{
        //console.log(req.params.id,"id passed for paypal success");
        let products=await userHelper.getPaypalOrderData(req.params.id)
        products=JSON.stringify(products)
        //console.log(products,"============Stringified prods===========");
        userHelper.decreaseStock(products).then(()=>{
            userHelper.changePaymentStatus(req.params.id).then(()=>{
                res.render('user/order-success')
            })
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
        //console.log(req.session.user._id,"user id check");
        req.body.totalPrice=parseInt(req.body.totalPrice)
        req.body.userId=req.session.user._id
        console.log(req.body,"=======coupon data========");
        couponHelpers.enterCoupon(req.body).then((response)=>{
            console.log(response);
            res.json(response)
        }).catch((err)=>{
            let couponError=err.couponError
            console.log(err.couponError);
            res.json({couponError})
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
            userHelper.cancelCODOrder(req.body.orderId,req.body.productId,req.body.quantity,req.body.cancelStatus,req.body.reason)
            .then((response)=>{
                res.json(response)
            }).catch(()=>{
                console.log("Something went wrong");
            })
        }
        else if (req.body.cancelStatus=='Cancel Requested'){
            console.log('Cancel Requested');
            userHelper.cancelOrder(req.body.orderId,req.body.productId,req.body.quantity,req.body.cancelStatus,req.body.reason)
            .then((response)=>{
                res.json(response)
            }).catch(()=>{
                console.log("Something went wrong");
            })
        }

    },

    orderReturn:(req,res)=>{
        // console.log(req.body,"what is in order return body");
        userHelper.doReturnOrder(req.body.orderId,req.body.productId,req.body.returnStatus,req.body.reason).then((response)=>{
            res.json(response)
        })
    },

    // To submit edited basic user creds

    postEditedBasicCreds:(req,res)=>{
        let userId=req.session.user._id
        console.log(req.body,"Basic user data for edits");
        userHelper.updateBasicUserData(userId,req.body).then(()=>{
            res.redirect('/edit-credentials')
        })
    },

    // To submit edited important user creds

    postEditedImportantCreds:(req,res)=>{
        let userId=req.session.user._id
        console.log(req.body,"Important user data for edits");
        userHelper.updateImportantUserData(userId,req.body).then((response)=>{
            res.redirect('/edit-credentials')
        })
    }

    

    

}
