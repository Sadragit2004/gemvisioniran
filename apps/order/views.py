# apps/cart/views.py
from django.http import JsonResponse
from django.shortcuts import get_object_or_404,render
from apps.file.models import File
from apps.order.shop_cart import ShopCart
from django.views.decorators.http import require_POST

def add_to_cart(request, file_id):
    cart = ShopCart(request)
    file = get_object_or_404(File, id=file_id)
    cart.add(file)

    # دریافت اطلاعات به‌روز شده سبد خرید
    cart_items = cart.get_cart()
    cart_total = cart.get_total_price()

    return JsonResponse({
        "success": True,
        "count": len(cart),
        "total_price": cart_total,
        "cart_items": [
            {
                "file_id": item["file"].id,
                "title": item["title"],
                "price": str(item["price"]),
                "image": item["image"],
                "url": item["file"].get_absolute_url()
            }
            for item in cart_items
        ]
    })



def cart_count(request):
    cart = ShopCart(request)
    return JsonResponse({
        "count": len(cart),
        "total_price": cart.get_total_price(),
    })


    
def show_item(request):
    cart = ShopCart(request)
    items = cart.get_cart()
    total_price = cart.get_total_price()

    return JsonResponse({
        "success": True,
        "cart_total": total_price,
        "cart_count": len(cart),
        "cart_items": [
            {
                "file_id": item["file"].id,
                "title": item["title"],
                "price": str(item["price"]),
                "image": item["image"],
                "url": item["file"].get_absolute_url()
            }
            for item in items
        ]
    })




@require_POST
def remove_from_cart(request, file_id):
    cart = ShopCart(request)
    file = get_object_or_404(File, id=file_id)
    cart.remove(file)

    # دریافت اطلاعات به‌روز شده سبد خرید
    cart_items = cart.get_cart()
    cart_total = cart.get_total_price()

    return JsonResponse({
        "success": True,
        "count": len(cart),
        "total_price": cart_total,
        "cart_items": [
            {
                "file_id": item["file"].id,
                "title": item["title"],
                "price": str(item["price"]),
                "image": item["image"],
                "url": item["file"].get_absolute_url()
            }
            for item in cart_items
        ]
    })