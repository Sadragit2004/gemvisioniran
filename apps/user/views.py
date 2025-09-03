from django.shortcuts import render, redirect
from django.utils import timezone
from django.contrib import messages
from django.contrib.auth import login,logout
from django.views.decorators.csrf import csrf_exempt
import random
from datetime import timedelta

from .forms import MobileForm, VerificationCodeForm
from .models import CustomUser, UserSecurity
import utils

# ======================
# مرحله 1: ورود شماره موبایل
# ======================
def send_mobile(request):
    if request.method == "POST":
        form = MobileForm(request.POST)
        if form.is_valid():
            mobile = form.cleaned_data['mobileNumber']

            # بررسی وجود کاربر
            user, created = CustomUser.objects.get_or_create(mobileNumber=mobile)

            if created:
                # کاربر جدید ساخته شد
                user.isActive = False
                user.save()

                # امنیت یوزر بسازیم
                UserSecurity.objects.create(user=user)

            # تولید کد تأیید
            code = utils.create_random_code(5)
            expire_time = timezone.now() + timedelta(minutes=2)

            # ذخیره در UserSecurity
            security = user.security
            security.activeCode = code
            security.expireCode = expire_time
            security.isBan = False
            security.save()

            # TODO: اینجا باید کد رو با SMS API ارسال کنی
            print(f"کد تأیید برای {mobile}: {code}")

            # ارسال کاربر به صفحه‌ی تایید کد
            request.session["mobileNumber"] = mobile
            return redirect("account:verify_code")

    else:
        form = MobileForm()

    return render(request, "user_app/register.html", {"form": form})


# ======================
# مرحله 2: تأیید کد
# ======================
import json
from django.http import JsonResponse

def verify_code(request):
    mobile = request.session.get("mobileNumber")
    if not mobile:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'message': 'شماره موبایل یافت نشد'})
        return redirect("account:send_mobile")

    try:
        user = CustomUser.objects.get(mobileNumber=mobile)
        security = user.security
    except CustomUser.DoesNotExist:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'message': 'کاربری با این شماره موبایل یافت نشد'})
        messages.error(request, "کاربری با این شماره موبایل یافت نشد.")
        return redirect("account:send_mobile")

    if request.method == "POST":
        # بررسی درخواست ارسال مجدد
        if "resend" in request.POST and request.POST["resend"] == "true":
            code = utils.create_random_code(5)
            expire_time = timezone.now() + timedelta(minutes=2)

            security.activeCode = code
            security.expireCode = expire_time
            security.isBan = False
            security.save()

            # 📌 اینجا باید SMS API بزنی
            print(f"🔄 کد جدید برای {mobile}: {code}")

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'message': 'کد جدید ارسال شد'})

            messages.success(request, "کد جدید ارسال شد ✅")
            return redirect("account:verify_code")

        # ✅ حالت معمولی: بررسی کد
        form = VerificationCodeForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['activeCode']

            # بررسی تاریخ انقضا
            if security.expireCode and security.expireCode < timezone.now():
                messages.error(request, "⏳ کد منقضی شده است، دوباره تلاش کنید.")
                return redirect("account:send_mobile")

            # بررسی صحت کد
            if security.activeCode != code:
                messages.error(request, "❌ کد تأیید اشتباه است.")
            else:

                # فعال کردن کاربر
                user.is_active = True
                user.save()

                security.activeCode = None
                security.expireCode = None
                security.save()

                login(request, user)
                messages.success(request, "✅ ورود موفقیت‌آمیز بود.")
                return redirect("main:index")

    else:
        form = VerificationCodeForm()

    return render(request, "user_app/verify_otp.html", {"form": form, "mobile": mobile})


def user_logout(request):
    logout(request)
    messages.success(request, "✅ شما با موفقیت از حساب کاربری خارج شدید.")
    return redirect("main:index")