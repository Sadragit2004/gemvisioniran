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

// وقتی صفحه لود شد
document.addEventListener("DOMContentLoaded", updateCartCount);

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
    const itemCountElement = document.querySelector("#dropdownBasketDesktop .text-text\\/90");
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
  const itemCountElement = document.querySelector("#dropdownBasketDesktop .text-text\\/90");
  if (itemCountElement) {
    itemCountElement.innerText = `${items.length} مورد`;
  }
}