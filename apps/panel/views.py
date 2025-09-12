from django.shortcuts import render

from django.contrib.auth.decorators import login_required
from apps.order.models import Order, OrderStatus
# Create your views here.


@login_required
def dashboard_view(request):

    current_user = request.user

    user_orders = Order.objects.filter(user=current_user).order_by('-createAt')

    current_orders = user_orders.filter(
        status__in=[
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.ON_HOLD
        ]
    )

    delivered_orders = user_orders.filter(status=OrderStatus.DELIVERED)
    cancelled_orders = user_orders.filter(status=OrderStatus.CANCELLED)
    refunded_orders = user_orders.filter(status=OrderStatus.REFUNDED)

    # آماده‌سازی context برای ارسال به تمپلیت
    context = {
        # لیست‌ها برای نمایش آمار در بالای صفحه
        'success': current_orders,
        'arrived': delivered_orders,
        'failed': cancelled_orders,  # کلمه faield در تمپلیت به failed اصلاح شد
        'returned_orders': refunded_orders, # کلمه return در پایتون رزرو شده است

        # لیست سفارش‌های فعلی برای نمایش جزئیات
        'order_list': current_orders[:8],

        # داده‌های موقت چون مدل مربوطه ارائه نشده است
        'len_favorit': 0,
        'len_not_seen': 0,
    }

    # نام فایل تمپلیت را dashboard.html در نظر گرفتم
    return render(request, 'panel_app/dashboard_profile.html', context)




@login_required
def user_orders_list_view(request):
    """
    یک ویو واحد برای نمایش تمام سفارشات کاربر در تب‌های مختلف.
    """
    # ۱. دریافت تمام سفارش‌های کاربر فعلی
    user_orders = Order.objects.filter(user=request.user).order_by('-createAt')

    # ۲. دسته‌بندی سفارش‌ها بر اساس وضعیت
    current_orders = user_orders.filter(status__in=[
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.ON_HOLD
    ])
    delivered_orders = user_orders.filter(status=OrderStatus.DELIVERED)
    cancelled_orders = user_orders.filter(status=OrderStatus.CANCELLED)
    refunded_orders = user_orders.filter(status=OrderStatus.REFUNDED)

    # ۳. آماده‌سازی context برای ارسال به تمپلیت
    context = {
        # لیستی از ۲ سفارش فعلی برای نمایش در بالای صفحه
        'top_current_orders': current_orders[:2],

        # لیست‌های کامل برای هر تب
        'current_orders_tab': current_orders,
        'delivered_orders_tab': delivered_orders,
        'cancelled_orders_tab': cancelled_orders,
        'refunded_orders_tab': refunded_orders,
    }

    return render(request, 'panel_app/orders_list.html', context)