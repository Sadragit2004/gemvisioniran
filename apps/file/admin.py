from django.contrib import admin
from .models import Group, Feature, File, FeatureValue, FileFeature, FilesGallery


class FilesGalleryInline(admin.TabularInline):
    model = FilesGallery
    extra = 1


class FileFeatureInline(admin.TabularInline):
    model = FileFeature
    extra = 1


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "isActive", "createAt")
    list_filter = ("isActive", "createAt")
    search_fields = ("title", "slug", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [FileFeatureInline, FilesGalleryInline]


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "isActive")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ("title", "isActive")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(FeatureValue)
class FeatureValueAdmin(admin.ModelAdmin):
    list_display = ("value", "feature")
    list_filter = ("feature",)


@admin.register(FileFeature)
class FileFeatureAdmin(admin.ModelAdmin):
    list_display = ("file", "feature", "value", "filterValue")
    list_filter = ("feature",)


@admin.register(FilesGallery)
class FilesGalleryAdmin(admin.ModelAdmin):
    list_display = ("files", "alt", "image")
    search_fields = ("alt",)
