from django.shortcuts import render
from django.db.models import Count
from .models import File, Group


def file_list_view(request, template_name, order_by_field):
    files = File.objects.filter(isActive=True).order_by(order_by_field)[:10]
    return render(request, template_name, {"files": files})


def latest_files(request):
    return file_list_view(request, "files_app/latest_files.html", "-createAt")


def expensive_files(request):
    return file_list_view(request, "files_app/expensive_files.html", "-price")


def rich_groups(request):
    groups = Group.objects.annotate(file_count=Count("files_of_groups")).order_by("-file_count")[:10]
    return render(request, "files_app/rich_groups.html", {"groups": groups})
