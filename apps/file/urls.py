from django.urls import path
from . import views

app_name = "files"

urlpatterns = [
    path("latest/", views.latest_files, name="latest_files"),
    path("expensive/", views.expensive_files, name="expensive_files"),
    path("rich-groups/", views.rich_groups, name="rich_groups"),
]
