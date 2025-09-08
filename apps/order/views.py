# apps/cart/views.py
from django.http import JsonResponse
from django.shortcuts import get_object_or_404,render
from apps.file.models import File
from apps.order.shop_cart import ShopCart

def add_to_cart(request, file_id):
    cart = ShopCart(request)
    file = get_object_or_404(File, id=file_id)
    cart.add(file)
    return JsonResponse({
        "success": True,
        "count": len(cart),  # تعداد کل فایل‌ها
        "total_price": cart.get_total_price(),  # مجموع قیمت‌ها (برای آینده)
    })



def cart_count(request):
    cart = ShopCart(request)
    return JsonResponse({
        "count": len(cart),
        "total_price": cart.get_total_price(),
    })

def show_item(request):
    cart = ShopCart(request)
    items = cart.get_cart()  # این تابعی که نوشتی
    total_price = cart.get_total_price()
    return render(request, "order_app/cart/show_shop_cart.html", {
        "cart_items": items,
        "cart_total": total_price,
        "cart_count": len(cart),
    })
