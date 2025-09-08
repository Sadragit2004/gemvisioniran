
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
    }
  } catch (error) {
    console.error("خطا در افزودن به سبد خرید:", error);
  }
}