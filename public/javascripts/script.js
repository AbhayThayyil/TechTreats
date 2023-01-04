// add to cart 



function addToCart(prodId){
    $.ajax({
        url:'/add-to-cart/'+prodId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)
            }
            swal({
                title: "Product Added!",
                text: "Product added to cart successfully!",
                icon: "success",
                button: "Ok!",
              }).then(()=>{
                location.reload();
              });  
        }
        
        
    })
}


//change quantity function

function changeQuantity(cartId,prodId,userId,count){
    let quantity=parseInt(document.getElementById(prodId).innerHTML)
    count=parseInt(count)
    console.log(userId);

    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
            cart:cartId,
            product:prodId, 
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                swal({
                    title: "Product Removed!",
                    text: "Product removed from cart!",
                    icon: "success",
                    button: "Ok!",
                  }).then(()=>{
                    location.reload();
                  });  
                  
            }
            else{
                console.log(response,"response in ajax ");
                document.getElementById(prodId).innerHTML=quantity+count
                document.getElementById("totalAmount").innerHTML=response.total
            }
        }
    })
}


//remove cart item

function removeCartItem(cartId,prodId){
    // console.log(cartId,"cartid in ajax",prodId,"prodid in ajax");
    $.ajax({
        url:'/remove-cart-item',
        data:{
            cart:cartId,
            product:prodId,   
        },
        method:'post',
        success:(response)=>{
            // console.log(response,"what comes at the end");
            if(response.removeProduct){
                swal({
                    title: "Product Removed!",
                    text: "Product removed from cart!",
                    icon: "success",
                    button: "Ok!",
                  }).then(()=>{
                    location.reload();
                  });  
                
                
            }
            
        }
}
    )}


 //payment

 $("#checkout-form").submit((e)=>{
    e.preventDefault() 
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            alert(response)
            console.log(response,"======response checkout form in ajax========");
            if(response.codSuccess){
                $.ajax({
                    url:'/stock-reduce',
                    data:{
                        products:JSON.stringify(response.products)
                    },
                    method:'post',
                    success:(response)=>{
                        if(response.stockReduce){
                            location.href="/order-success"
                        }
                    }
                })
                location.href="/order-success"
            }
            else{
                
                razorpayPayment(response)
            }
        }
    })
 })

 function razorpayPayment(order){
    var options = {
        "key": "rzp_test_ewNm9lY0xHIOAt", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Tech Treat",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)

            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open()
 }



 function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                location.href="/order-success"
            }
            else{
                swal({
                    title: "Failure!",
                    text: "Payment Failed!",
                    icon: "error",
                    button: "Ok!",
                  })
            }
        }
    })
 }


 function deleteAddress(userId,addressid){
    console.log("ID checks",userId,addressid);
    $.ajax({
        url:'/delete-address',
        data:{
            user:userId,
            address:addressid
        },
        method:'post',
        success:(response)=>{
            console.log(response);
            if(response.deleteAddress){
                location.reload();
            }
            else{
                
            }
           
        }
    })
 }

 function updateDeliveryStatus(value,orderId,prodId){
    console.log(value,orderId,prodId,"checking parameters")

    $.ajax({
        url:'/admin/product-status',
        data:{
            order:orderId,
            product:prodId,
            changeValue:value
        },
        method:'post',
        success:(response)=>{
            swal({
                title: "Status Updated!",
                text: "Delivery status updated!",
                icon: "success",
                button: "Ok!",
              }).then(()=>{
                location.reload();
              });
            
        }
    })
 }
 
 
