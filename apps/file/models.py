from django.db import models
from django.utils import timezone
from ckeditor_uploader.fields import RichTextUploadingField
import utils


# ========================
# Base Model
# ========================
class Base(models.Model):
    title = models.CharField(max_length=100, verbose_name="عنوان")
    createAt = models.DateTimeField(default=timezone.now, verbose_name="تاریخ ساخته شده")
    updateAt = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="نامک")
    isActive = models.BooleanField(default=False, verbose_name="فعال / غیرفعال")

    class Meta:
        abstract = True

    def __str__(self):
        return self.title


# ========================
# گروه محصول
# ========================
class Group(Base):
    parent = models.ForeignKey(
        "self", verbose_name="والد", related_name="children",
        on_delete=models.CASCADE, null=True, blank=True
    )
    description = RichTextUploadingField(
        verbose_name="توضیحات", config_name="special", blank=True, null=True
    )

    class Meta:
        verbose_name = "گروه محصول"
        verbose_name_plural = "گروه‌های محصول"


# ========================
# ویژگی
# ========================
class Feature(Base):
    group = models.ManyToManyField(Group, verbose_name="گروه", related_name="features")

    class Meta:
        verbose_name = "ویژگی"
        verbose_name_plural = "ویژگی‌ها"


# ========================
# فایل (محصول)
# ========================
class File(Base):
    description = RichTextUploadingField(
        verbose_name="توضیحات", config_name="special", blank=True, null=True
    )
    price = models.PositiveIntegerField(default=0, verbose_name="قیمت")
    features = models.ManyToManyField(Feature, through="FileFeature", verbose_name="ویژگی‌ها")

    class Meta:
        verbose_name = "فایل"
        verbose_name_plural = "فایل‌ها"


# ========================
# مقدار ویژگی
# ========================
class FeatureValue(models.Model):
    value = models.CharField(max_length=100, verbose_name="مقدار")
    feature = models.ForeignKey(
        Feature, on_delete=models.CASCADE, verbose_name="ویژگی",
        null=True, blank=True, related_name="feature_values"
    )

    class Meta:
        verbose_name = "مقدار ویژگی"
        verbose_name_plural = "مقادیر ویژگی‌ها"

    def __str__(self):
        return f"{self.feature} → {self.value}"


# ========================
# ارتباط فایل با ویژگی
# ========================
class FileFeature(models.Model):
    file = models.ForeignKey(
        File, on_delete=models.CASCADE, verbose_name="فایل", related_name="features_value"
    )
    feature = models.ForeignKey(Feature, verbose_name="ویژگی", on_delete=models.CASCADE)
    value = models.CharField(max_length=40, verbose_name="مقدار کالا")
    filterValue = models.ForeignKey(
        FeatureValue, null=True, blank=True,
        on_delete=models.CASCADE, verbose_name="مقدار برای فیلترینگ"
    )

    class Meta:
        verbose_name = "ویژگی فایل"
        verbose_name_plural = "ویژگی‌های فایل"

    def __str__(self):
        return f"{self.file} | {self.feature} = {self.value}"


# ========================
# گالری فایل
# ========================
class FilesGallery(models.Model):
    files = models.ForeignKey(
        File, on_delete=models.CASCADE, verbose_name="فایل", related_name="gallery"
    )
    fileupload = utils.FileUpload('images', 'GalleryFile')
    alt = models.CharField(max_length=100, blank=True, null=True, verbose_name="متن جایگزین")
    image = models.ImageField(upload_to=fileupload.upload_to, verbose_name="تصویر")

    class Meta:
        verbose_name = "گالری فایل"
        verbose_name_plural = "گالری فایل‌ها"

    def __str__(self):
        return f"تصویر {self.files.title}"
