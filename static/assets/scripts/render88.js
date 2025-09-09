async function updateCartCount() {
  try {
    const response = await fetch("/order/count/", {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    const data = await response.json();
    document.getElementById("count_product").innerText = data.count;
    document.getElementById("count_product2").innerText = data.count;
  } catch (error) {
    console.error("خطا در گرفتن تعداد سبد خرید:", error);
  }
}

// تابع برای لود و نمایش آیتم‌های سبد خرید
async function loadCartItems() {
  try {
    const response = await fetch("/order/get-card/");
    const data = await response.json();

    const cartItemsList = document.getElementById("cart-items-list");
    const cartTotalElement = document.querySelector("#dropdownBasketDesktop [class*='text-text/90'] span.font-bold");
    const itemCountElement = document.querySelector("#dropdownBasketDesktop .text-sm.text-text\\/90");

    if (data.success) {
      // پاک کردن لیست فعلی
      cartItemsList.innerHTML = "";

      if (data.cart_items.length === 0) {
        cartItemsList.innerHTML = `
          <li class="text-center py-10 text-lg text-gray-500">
            سبد خرید شما خالی است
          </li>`;
      } else {
        // اضافه کردن آیتم‌ها به لیست
        data.cart_items.forEach(item => {
          const li = document.createElement("li");
          li.className = "item_";
          li.setAttribute("data-file-id", item.file_id);

          li.innerHTML = `
            <div class="flex gap-x-2 py-5">
              <!-- Product Image -->
              <div class="relative min-w-fit">
                <a href="${item.url}">
                  <img
                    alt="${item.title}"
                    class="h-[120px] w-[120px] object-cover rounded-md"
                    loading="lazy"
                    src="${item.image}"
                  />
                </a>
                <button
                  class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background"
                  type="button"
                  onclick="removeFromCart('${item.file_id}')"
                >
                  <svg class="h-6 w-6 text-red-600 dark:text-red-500">
                    <use xlink:href="#close" />
                  </svg>
                </button>
              </div>

              <div class="w-full space-y-1.5">
                <!-- File Title -->
                <a
                  class="line-clamp-2 h-12"
                  href="${item.url}"
                >
                  ${item.title}
                </a>

                <!-- Price -->
                <div class="flex items-center justify-between gap-x-2">
                  <div class="text-primary">
                    <span class="text-lg font-bold">${Number(item.price).toLocaleString()}</span>
                    <span class="text-sm">تومان</span>
                  </div>
                </div>
              </div>
            </div>
          `;

          cartItemsList.appendChild(li);
        });
      }

      // آپدیت بخش تعداد و مجموع
      if (itemCountElement) {
        itemCountElement.textContent = `${data.cart_count} مورد`;
      }

      if (cartTotalElement) {
        cartTotalElement.textContent = Number(data.cart_total).toLocaleString();
      }

      // آپدیت شمارنده
      document.getElementById("count_product").innerText = data.cart_count;
      document.getElementById("count_product2").innerText = data.cart_count;
    }
  } catch (error) {
    console.error("خطا در گرفتن سبد خرید:", error);
  }
}

// وقتی صفحه لود شد
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  loadCartItems(); // این تابع جدید رو اضافه کردیم
});

async function addToCart(fileId) {
  try {
    const response = await fetch(`/order/add/${fileId}/`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    const data = await response.json();
    if (data.success) {
      // آپدیت کردن تعداد آیتم‌های سبد خرید
      document.getElementById("count_product").innerText = data.count;
      document.getElementById("count_product2").innerText = data.count;

      // آپدیت لیست سبد خرید
      updateCartItems(data.cart_items, data.total_price);
    }
  } catch (error) {
    console.error("خطا در افزودن به سبد خرید:", error);
  }
}

// تابع برای حذف از سبد خرید
async function removeFromCart(fileId) {
  try {
    const response = await fetch(`/order/remove/${fileId}/`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": getCsrfToken(),
        "Content-Type": "application/json",
      }
    });

    const data = await response.json();
    if (data.success) {
      // آپدیت کردن تعداد آیتم‌های سبد خرید
      document.getElementById("count_product").innerText = data.count;
      document.getElementById("count_product2").innerText = data.count;

      // آپدیت لیست سبد خرید
      updateCartItems(data.cart_items, data.total_price);

      // انیمیشن حذف آیتم
      const itemElement = document.querySelector(`.item_[data-file-id="${fileId}"]`);
      if (itemElement) {
        itemElement.style.transition = "all 0.3s ease";
        itemElement.style.opacity = "0";
        itemElement.style.height = "0";
        itemElement.style.overflow = "hidden";

        setTimeout(() => {
          itemElement.remove();
        }, 300);
      }
    }
  } catch (error) {
    console.error("خطا در حذف از سبد خرید:", error);
  }
}

// تابع برای دریافت CSRF token
function getCsrfToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
}

function updateCartItems(items, totalPrice) {
  const cartItemsList = document.getElementById("cart-items-list");
  const cartTotalElement = document.querySelector("#dropdownBasketDesktop [class*='text-text/90'] span.font-bold");
  const itemCountElement = document.querySelector("#dropdownBasketDesktop .text-sm.text-text\\/90");

  // اگر سبد خرید خالی است
  if (items.length === 0) {
    cartItemsList.innerHTML = `
      <li class="text-center py-10 text-lg text-gray-500">
        سبد خرید شما خالی است
      </li>
    `;

    // آپدیت مبلغ کل به صفر
    if (cartTotalElement) {
      cartTotalElement.innerText = "0";
    }

    // آپدیت تعداد آیتم‌ها در بخش پایینی
    if (itemCountElement) {
      itemCountElement.innerText = "0 مورد";
    }

    return;
  }

  // تولید HTML برای آیتم‌های سبد خرید
  let itemsHTML = '';
  items.forEach(item => {
    itemsHTML += `
      <li class="item_" data-file-id="${item.file_id}">
        <div class="flex gap-x-2 py-5">
          <!-- Product Image -->
          <div class="relative min-w-fit">
            <a href="${item.url}">
              <img
                alt="${item.title}"
                class="h-[120px] w-[120px] object-cover rounded-md"
                loading="lazy"
                src="${item.image}"
              />
            </a>
            <button
              class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background"
              type="button"
              onclick="removeFromCart('${item.file_id}')"
            >
              <svg class="h-6 w-6 text-red-600 dark:text-red-500">
                <use xlink:href="#close" />
              </svg>
            </button>
          </div>

          <div class="w-full space-y-1.5">
            <!-- File Title -->
            <a
              class="line-clamp-2 h-12"
              href="${item.url}"
            >
              ${item.title}
            </a>

            <!-- Price -->
            <div class="flex items-center justify-between gap-x-2">
              <div class="text-primary">
                <span class="text-lg font-bold">${parseInt(item.price).toLocaleString()}</span>
                <span class="text-sm">تومان</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    `;
  });

  // به‌روزرسانی لیست و مبلغ کل
  cartItemsList.innerHTML = itemsHTML;

  if (cartTotalElement) {
    cartTotalElement.innerText = parseInt(totalPrice).toLocaleString();
  }

  // آپدیت تعداد آیتم‌ها در بخش پایینی
  if (itemCountElement) {
    itemCountElement.innerText = `${items.length} مورد`;
  }
}


// تابع برای لود سبد خرید موبایل
async function loadMobileCartItems() {
  try {
    const response = await fetch("/order/get-card/");
    const data = await response.json();

    const mobileCartList = document.getElementById("mobile_list_cart");
    const mobileTotalElement = document.querySelector("#user-basket-drawer-navigation [class*='text-text/90'] .font-bold");

    if (data.success) {
      // پاک کردن لیست فعلی
      mobileCartList.innerHTML = "";

      if (data.cart_items.length === 0) {
        mobileCartList.innerHTML = `
          <li class="text-center py-10 text-lg text-gray-500">
            سبد خرید شما خالی است
          </li>`;
      } else {
        // اضافه کردن آیتم‌ها به لیست موبایل
        data.cart_items.forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
            <div class="flex gap-x-2 py-5">
              <!-- Product Image -->
              <div class="relative min-w-fit">
                <a href="${item.url}">
                  <img
                    alt="${item.title}"
                    class="h-20 w-20 object-cover rounded-md"
                    loading="lazy"
                    src="${item.image}"
                  />
                </a>
                <button
                  class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background"
                  type="button"
                  onclick="removeFromCartMobile('${item.file_id}')"
                >
                  <svg class="h-6 w-6 text-red-600 dark:text-red-500">
                    <use xlink:href="#close" />
                  </svg>
                </button>
              </div>

              <div class="w-full space-y-1.5">
                <!-- File Title -->
                <a
                  class="line-clamp-2 h-10 text-sm"
                  href="${item.url}"
                >
                  ${item.title}
                </a>

                <!-- Price -->
                <div class="flex items-center justify-between gap-x-2">
                  <div class="text-primary">
                    <span class="font-bold">${Number(item.price).toLocaleString()}</span>
                    <span class="text-xs">تومان</span>
                  </div>
                </div>
              </div>
            </div>
          `;

          mobileCartList.appendChild(li);
        });
      }

      // آپدیت مبلغ کل در موبایل
      if (mobileTotalElement) {
        mobileTotalElement.textContent = Number(data.cart_total).toLocaleString();
      }
    }
  } catch (error) {
    console.error("خطا در گرفتن سبد خرید موبایل:", error);
  }
}

// تابع برای حذف از سبد خرید موبایل
async function removeFromCartMobile(fileId) {
  try {
    const response = await fetch(`/order/remove/${fileId}/`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": getCsrfToken(),
        "Content-Type": "application/json",
      }
    });

    const data = await response.json();
    if (data.success) {
      // آپدیت شمارنده
      document.getElementById("count_product").innerText = data.count;
      document.getElementById("count_product2").innerText = data.count;

      // آپدیت سبد خرید دسکتاپ
      updateCartItems(data.cart_items, data.total_price);

      // آپدیت سبد خرید موبایل
      loadMobileCartItems();

      // انیمیشن حذف آیتم (اختیاری)
      const itemElement = document.querySelector(`[onclick="removeFromCartMobile('${fileId}')"]`).closest('li');
      if (itemElement) {
        itemElement.style.transition = "all 0.3s ease";
        itemElement.style.opacity = "0";
        itemElement.style.height = "0";
        itemElement.style.overflow = "hidden";

        setTimeout(() => {
          itemElement.remove();
        }, 300);
      }
    }
  } catch (error) {
    console.error("خطا در حذف از سبد خرید موبایل:", error);
  }
}

// وقتی صفحه لود شد، هر دو سبد خرید رو لود کن
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  loadCartItems(); // برای دسکتاپ
  loadMobileCartItems(); // برای موبایل
});

// تابع addToCart رو هم آپدیت کنیم تا موبایل رو هم به روز کنه
async function addToCart(fileId) {
  try {
    const response = await fetch(`/order/add/${fileId}/`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    const data = await response.json();
    if (data.success) {
      // آپدیت کردن تعداد آیتم‌های سبد خرید
      document.getElementById("count_product").innerText = data.count;
      document.getElementById("count_product2").innerText = data.count;

      // آپدیت لیست سبد خرید دسکتاپ
      updateCartItems(data.cart_items, data.total_price);

      // آپدیت لیست سبد خرید موبایل
      loadMobileCartItems();
    }
  } catch (error) {
    console.error("خطا در افزودن به سبد خرید:", error);
  }
}


