

show_function();



function show_function(){
    $.ajax({
        type:'GET',
        url:'/orders/show_count/',


        success: function(res){



            $('#count_product').text(res);
            $('#count_product2').text(res);



        }


    });
}

function add_to_shop_cart(product_id, qty) {
    $.ajax({
      type: 'GET',
      url: '/orders/add_to_shop_cart/',
      data: {
        product_id: product_id,
        qty: qty,
      },

      success: function(res) {
        $('#count_product').text(res);
        $('#count_product2').text(res);
        show_function();

        // Display the success modal
        $('#div_my').removeClass('hidden');
        var successSound = document.getElementById("successSound");
        successSound.play();

        // Hide the success modal after 2 seconds
        setTimeout(function() {
          $('#div_my').addClass('hidden');
        }, 2000);
      },
    });
  }
//================================
function delete_to_shop_cart(product_id){
    $.ajax({
        type: 'GET',
        url: '/orders/delete_to_cart/',
        data: { product_id: product_id },
        success: function(res) {
            $('#list_shop_cart').html(res);
            show_function();
            // Show the success modal

        }
    });
}


function delete_to_shop_cart2(product_id){

    $.ajax({
        type:'GET',
        url:'/orders/delete_to_cart2/',
        data:{
            product_id:product_id,
        },

        success: function(res){
            $('#my_header_list').html (res);
            show_function();

        }




    });
}


function delete_to_shop_cart_mobile(product_id){

    $.ajax({
        type:'GET',
        url:'/orders/delete_to_cart_mobile/',
        data:{
            product_id:product_id,
        },

        success: function(res){
            $('#mobile_list_cart').html (res);
            show_function();

        }


    });
}


function delete_all_list(){
    $.ajax({
        type:'GET',
        url:'/orders/delete_all/',

        success: function(res){
            $('#list_shop_cart').html(res);
            show_function();

        }

    });
}


//===========================================
function add_to_cart_detail(product_id,qty){

    if (qty===0){
        qty=$("#counter").val();
        alert(qty);
        alert(product_id);
      }


    $.ajax({

        type:'GET',
        url:'/orders/add_to_shop_cart/',
        data:{
            product_id:product_id,
            qty:qty,
        },


        success: function(res){

            show_function();

        }


    });



}

//=================================
function add_to_cart_detail(product_id, qty) {

    if (qty === 0) {
        qty = $("#counter").val();
    }

    // Get the selected color and its value and title
    var selectedColorId = $("input[name='color-desktop']:checked").val();
    var selectedColorValue = $("label[for='color-desktop-" + selectedColorId + "'] p").text();
    var selectedColorTitle = $("label[for='color-desktop-" + selectedColorId + "']").attr("title");

    // Get the selected size and its value and title
    var selectedSizeId = $("input[name='size-desktop']:checked").val();
    var selectedSizeValue = $("label[for='size-desktop-" + selectedSizeId + "'] p").text();
    var selectedSizeTitle = $("label[for='size-desktop-" + selectedSizeId + "']").attr("title");


    // Perform the AJAX request
    $.ajax({
        type: 'GET',
        url: '/orders/add_to_shop_cart/',
        data: {
            product_id: product_id,
            qty: qty,
            color_id: selectedColorId,
            color_value: selectedColorValue,
            color_title: selectedColorTitle,
            size_id: selectedSizeId,
            size_value: selectedSizeValue,
            size_title: selectedSizeTitle
        },
        success: function(res) {
            $('#count_product').text(res);
            $('#count_product2').text(res);
            show_function();

            // Display the success modal
            $('#div_my').removeClass('hidden');
            var successSound = document.getElementById("successSound");
            successSound.play();

            // Hide the success modal after 2 seconds
            setTimeout(function() {
              $('#div_my').addClass('hidden');
            }, 2000);
          },
        });
      }



//=================================
function update_cart() {
    var product_id_list = [];
    var qty_list = [];

    $("input[id^='qty_']").each(function(index){
        product_id_list.push($(this).attr('id').slice(4));  // دریافت شناسه محصول
        qty_list.push($(this).val());  // دریافت مقدار جدید
    });

    $.ajax({
        type: 'GET',
        url: '/orders/update_cart/',
        data: {
            product_id_list: product_id_list,
            qty_list: qty_list,
        },
        success: function(res) {
            $('#list_shop_cart').html(res);
            $('#my_header_list').html(res);
            show_function();
            alert('بروزرسانی سبد خرید با موفقیت انجام شد');
        }
    });
}



//========================================================
function update_cart2(){
    var product_id_list = []
    var qty_list = []

    $("input[id^='qt2_']").each(function(index){
        product_id_list.push($(this).attr('id').slice(4));
        qty_list.push($(this).val());
        });


        $.ajax({
            type: 'GET',
            url: '/orders/update_cart2/',
            data: {

                product_id_list: product_id_list,
                qty_list : qty_list,

            },
        success: function(res) {
            $('#my_header_list').html (res);
            show_function();
            alert('بروزرسانی سبد خرید با موفقیت انجام شد');
        }
    });

    // Optionally re-disable the inputs after the update
}


function update_cart3(){
    var product_id_list = []
    var qty_list = []

    $("input[id^='qt3_']").each(function(index){
        product_id_list.push($(this).attr('id').slice(4));
        qty_list.push($(this).val())
        });


        $.ajax({
            type: 'GET',
            url: '/orders/update_cart3/',
            data: {

                product_id_list: product_id_list,
                qty_list : qty_list,

            },
            success: function(res) {
                $('#mobile_list_cart').html (res);
                show_function();
                alert('بروزرسانی سبد خرید با موفقیت انجام شد')
                // Show the success modal

            }
        });
}






function confirm_seen(user,product){

    console.log('hello');

    $.ajax({

        type:'GET',
        url:'/dashboard_profile/confirm_seen/',
        data:{
            user_id:user,
            product_id:product,
        },

        success: function(res) {

            console.log('ok');
            // Show the success modal

        }


    });


  }



  document.getElementById('special-sale-link').addEventListener('click', function(e) {
    e.preventDefault(); // جلوگیری از عملکرد پیش‌فرض لینک

    // گرفتن موقعیت عنصر هدف
    const specialProductsSection = document.getElementById('special-products');

    // محاسبه موقعیت مورد نظر برای اسکرول (وسط صفحه)
    const offsetTop = specialProductsSection.getBoundingClientRect().top + window.scrollY;
    const offset = offsetTop - (window.innerHeight / 2) + (specialProductsSection.clientHeight / 2);

    // اسکرول نرم به محل دقیق
    window.scrollTo({
      top: offset,
      behavior: 'smooth' // اسکرول نرم
    });
  });


  document.addEventListener('DOMContentLoaded', function() {
    const localTimeElement = document.getElementById('local-time');

    if (localTimeElement) {
        function updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            localTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }

        // فراخوانی اولیه برای آپدیت کردن زمان
        updateTime();

        // آپدیت کردن زمان هر ثانیه
        setInterval(updateTime, 1000);
    }
});


document.getElementById("searchIcon").addEventListener("click", function () {
    const input = document.getElementById("mobileHeaderSearch");

    // شبیه‌سازی فشار دادن کلید "Enter"
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13, // کد کلید Enter
      which: 13,
      bubbles: true
    });

    input.dispatchEvent(enterEvent);  // ارسال رویداد به فیلد ورودی
  });


  function fill_city() {
    let city = document.getElementById('city');
    let province = document.getElementById('province');
    let user_id = document.getElementById('user_id22');

    $.ajax({
      type: 'GET',
      url: '/orders/fill_city/',
      data: {
        user_id: user_id.textContent,
        city: city.value,
        province: province.value,
      },
      success: function(res) {
       
        // فرم را به صورت دستی سابمیت می‌کنیم
        document.getElementById('myForm').submit();
      },
    });

    // بازگشت false باعث می‌شود که فرم به صورت خودکار سابمیت نشود
    return false;
  }
