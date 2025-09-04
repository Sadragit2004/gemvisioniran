from django.contrib import admin
from django.utils.html import format_html
from django.utils.text import slugify
from django.db.models import Count, Prefetch, Q

from .models import File, Group, Feature, FeatureValue, FileFeature, FilesGallery


# ========================
# فیلترهای سفارشی
# ========================
class HasImageFilter(admin.SimpleListFilter):
    title = "دارای تصویر"
    parameter_name = "has_image"

    def lookups(self, request, model_admin):
        return (
            ("yes", "بله"),
            ("no", "خیر"),
        )

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.filter(Q(image__isnull=False) & ~Q(image=""))
        if self.value() == "no":
            return queryset.filter(Q(image__isnull=True) | Q(image=""))
        return queryset


class PriceLevelFilter(admin.SimpleListFilter):
    title = "بازه قیمتی"
    parameter_name = "price_level"

    def lookups(self, request, model_admin):
        return (
            ("low", "کمتر از 500K"),
            ("mid", "500K تا 2M"),
            ("high", "بیشتر از 2M"),
        )

    def queryset(self, request, queryset):
        if self.value() == "low":
            return queryset.filter(price__lt=500_000)
        if self.value() == "mid":
            return queryset.filter(price__gte=500_000, price__lte=2_000_000)
        if self.value() == "high":
            return queryset.filter(price__gt=2_000_000)
        return queryset


# ========================
# اینلاین‌ها
# ========================
class FilesGalleryInline(admin.TabularInline):
    model = FilesGallery
    extra = 1
    fields = ("preview", "image", "alt")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj and getattr(obj, "image", None):
            return format_html('<img src="{}" style="height:60px;border-radius:8px" />', obj.image.url)
        return "—"
    preview.short_description = "پیش‌نمایش"


class FileFeatureInline(admin.TabularInline):
    model = FileFeature
    extra = 1
    autocomplete_fields = ("feature", "filterValue")
    fields = ("feature", "value", "filterValue")


# ========================
# ادمین File (جدول قدرتمند)
# ========================
@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    # جدول لیست
    list_display = (
        "thumb", "title", "price_fmt", "isActive",
        "groups_short", "features_count", "gallery_count", "createAt", "updateAt",
    )
    list_display_links = ("title",)
    list_editable = ("isActive",)
    ordering = ("-createAt",)
    list_per_page = 25

    # سرچ و فیلتر
    search_fields = ("title", "slug", "description")
    list_filter = (
        "isActive",
        "group",                 # فیلتر ManyToMany مستقیم کار می‌کند
        HasImageFilter,
        PriceLevelFilter,
        ("createAt", admin.DateFieldListFilter),
        ("updateAt", admin.DateFieldListFilter),
    )

    # فرم و ویرایش
    readonly_fields = ("createAt", "updateAt", "thumb_large")
    autocomplete_fields = ()  # اگر تعداد Feature/Group زیاد است، می‌توان اینجا اضافه کرد
    filter_horizontal = ("group",)  # برای انتخاب راحت گروه‌ها
    prepopulated_fields = {"slug": ("title",)}  # اگر می‌خواهی اتومات پر شود
    inlines = (FilesGalleryInline, FileFeatureInline)

    fieldsets = (
        ("اطلاعات اصلی", {
            "fields": ("title", "slug", "isActive", "price", "description")
        }),
        ("دسته‌بندی و تصویر", {
            "fields": ("group", "image", "thumb_large"),
        }),
        ("متادیتا", {
            "classes": ("collapse",),
            "fields": ("createAt", "updateAt"),
        }),
    )

    # بهینه‌سازی کوئری و شمارنده‌ها
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # شمارنده‌های گالری و ویژگی‌ها
        qs = qs.annotate(
            _gallery_count=Count("gallery", distinct=True),
            _features_count=Count("features_value", distinct=True),
        ).prefetch_related(
            "group",
            Prefetch("features_value", queryset=FileFeature.objects.select_related("feature", "filterValue")),
            Prefetch("gallery", queryset=FilesGallery.objects.only("id", "image", "alt")),
        )
        return qs

    # ستون‌های محاسبه‌ای
    def price_fmt(self, obj):
        if obj.price is None:
            return "—"
        return f"{obj.price:,} تومان"
    price_fmt.short_description = "قیمت"

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:48px;width:48px;object-fit:cover;border-radius:8px" />', obj.image.url)
        return "—"
    thumb.short_description = "تصویر"

    def thumb_large(self, obj):
        if obj and obj.image:
            return format_html('<img src="{}" style="max-height:180px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.08)" />', obj.image.url)
        return "—"
    thumb_large.short_description = "پیش‌نمایش بزرگ"

    def groups_short(self, obj):
        names = [g.title for g in obj.group.all()[:3]]
        more = obj.group.count() - len(names)
        if more > 0:
            names.append(f"+{more}")
        return "، ".join(names) if names else "—"
    groups_short.short_description = "گروه‌ها"

    def gallery_count(self, obj):
        return getattr(obj, "_gallery_count", 0)
    gallery_count.short_description = "تعداد تصاویر"
    gallery_count.admin_order_field = "_gallery_count"

    def features_count(self, obj):
        return getattr(obj, "_features_count", 0)
    features_count.short_description = "تعداد ویژگی‌ها"
    features_count.admin_order_field = "_features_count"

    # اکشن‌ها
    actions = ["make_active", "make_inactive", "export_csv"]

    def make_active(self, request, queryset):
        updated = queryset.update(isActive=True)
        self.message_user(request, f"{updated} مورد فعال شد.")
    make_active.short_description = "فعال‌سازی انتخاب‌شده‌ها"

    def make_inactive(self, request, queryset):
        updated = queryset.update(isActive=False)
        self.message_user(request, f"{updated} مورد غیرفعال شد.")
    make_inactive.short_description = "غیرفعال‌سازی انتخاب‌شده‌ها"

    def export_csv(self, request, queryset):
        """
        خروجی CSV از فایل‌های انتخابی
        """
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="files.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Title", "Slug", "Price", "IsActive", "Groups", "CreateAt", "UpdateAt"])

        for obj in queryset:
            groups = " | ".join(obj.group.values_list("title", flat=True))
            writer.writerow([obj.id, obj.title, obj.slug, obj.price, obj.isActive, groups, obj.createAt, obj.updateAt])

        return response
    export_csv.short_description = "خروجی CSV"


# ========================
# ادمین Group
# ========================
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "isActive", "files_count", "createAt")
    list_editable = ("isActive",)
    search_fields = ("title", "slug", "description")
    list_filter = ("isActive", ("createAt", admin.DateFieldListFilter))
    ordering = ("parent__title", "title")
    prepopulated_fields = {"slug": ("title",)}

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_files_count=Count("files_of_groups", distinct=True))

    def files_count(self, obj):
        return getattr(obj, "_files_count", 0)
    files_count.short_description = "تعداد فایل‌ها"
    files_count.admin_order_field = "_files_count"


# ========================
# ادمین Feature
# ========================
@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ("title", "isActive", "groups_count", "values_count")
    list_editable = ("isActive",)
    search_fields = ("title", "slug")
    list_filter = ("isActive", "group")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("group",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            _groups_count=Count("group", distinct=True),
            _values_count=Count("feature_values", distinct=True),
        )

    def groups_count(self, obj):
        return getattr(obj, "_groups_count", 0)
    groups_count.short_description = "تعداد گروه‌ها"
    groups_count.admin_order_field = "_groups_count"

    def values_count(self, obj):
        return getattr(obj, "_values_count", 0)
    values_count.short_description = "تعداد مقادیر"
    values_count.admin_order_field = "_values_count"


# ========================
# ادمین FeatureValue
# ========================
@admin.register(FeatureValue)
class FeatureValueAdmin(admin.ModelAdmin):
    list_display = ("value", "feature")
    search_fields = ("value", "feature__title")
    list_filter = ("feature",)
    autocomplete_fields = ("feature",)


# ========================
# ادمین FilesGallery
# ========================
@admin.register(FilesGallery)
class FilesGalleryAdmin(admin.ModelAdmin):
    list_display = ("preview", "files", "alt")
    search_fields = ("files__title", "alt")
    autocomplete_fields = ("files",)

    def preview(self, obj):
        if obj and getattr(obj, "image", None):
            return format_html('<img src="{}" style="height:48px;border-radius:8px" />', obj.image.url)
        return "—"
    preview.short_description = "پیش‌نمایش"


# ========================
# ادمین FileFeature
# ========================
@admin.register(FileFeature)
class FileFeatureAdmin(admin.ModelAdmin):
    list_display = ("file", "feature", "value", "filterValue")
    search_fields = ("file__title", "feature__title", "value", "filterValue__value")
    autocomplete_fields = ("file", "feature", "filterValue")
    list_filter = ("feature",)

