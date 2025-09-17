from django.shortcuts import render,get_object_or_404,redirect

from django.contrib.auth.decorators import login_required
from apps.order.models import Order, OrderStatus
from django.conf import settings
from django.http import FileResponse, Http404
import os
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

from django.contrib import messages

@login_required
def order_detail_view(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)

    context = {
        'order': order
    }

    return render(request, 'panel_app/order_detail.html', context)


# panel_app/views.py

from django.http import StreamingHttpResponse, Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from apps.order.models import Order
from apps.file.models import File
import requests
import os
from urllib.parse import urlparse

@login_required
def download_file_view(request, order_id, file_id):
    """
    این ویو مسئولیت دانلود امن فایل را بر عهده دارد.
    """
    # ۱. بررسی اینکه آیا سفارش متعلق به همین کاربر است یا نه
    order = get_object_or_404(Order, id=order_id, user=request.user)

    # ۲. بررسی اینکه آیا سفارش پرداخت شده است
    if not order.is_paid():
        return HttpResponseForbidden("دسترسی غیرمجاز! این سفارش هنوز پرداخت نشده است.")

    # ۳. بررسی اینکه آیا فایل درخواستی در این سفارش وجود دارد
    if not order.orders_details.filter(files_id=file_id).exists():
        raise Http404("این فایل در سفارش شما یافت نشد.")

    # ۴. دریافت فایل و لینک دانلود آن
    file_to_download = get_object_or_404(File, id=file_id)
    external_url = file_to_download.downloadLink

    if not external_url:
        raise Http404("لینک دانلودی برای این فایل تعریف نشده است.")

    try:
        # ۵. ارسال درخواست به لینک خارجی برای دریافت فایل
        # stream=True باعث می‌شود فایل به صورت تکه‌تکه دانلود شود تا حافظه سرور پر نشود
        response = requests.get(external_url, stream=True)
        response.raise_for_status()  # اگر لینک خراب بود یا خطایی رخ داد، اینجا متوقف می‌شود

        # ۶. آماده‌سازی پاسخ برای مرورگر کاربر
        # ما فایل را به صورت جریانی (stream) به کاربر می‌دهیم
        streaming_response = StreamingHttpResponse(
            response.iter_content(chunk_size=8192),
            content_type=response.headers.get('Content-Type', 'application/octet-stream')
        )

        # ۷. تنظیم هدرها برای اینکه مرورگر فایل را دانلود کند
        # استخراج نام فایل از URL
        filename = os.path.basename(urlparse(external_url).path)
        streaming_response['Content-Disposition'] = f'attachment; filename="{filename}"'
        streaming_response['Content-Length'] = response.headers.get('Content-Length', 0)

        return streaming_response

    except requests.exceptions.RequestException as e:
        # در صورت بروز خطا در دانلود از لینک اصلی
        return HttpResponseForbidden(f"خطا در دسترسی به فایل: {e}")