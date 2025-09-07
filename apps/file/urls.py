from django.urls import path
from .views import group_in_category,related_products,file_detail,latest_files,save_comment,expensive_files,rich_groups,show_by_filter,get_feature_filter

app_name = "files"

urlpatterns = [
    path("latest/", latest_files, name="latest_files"),
    path("expensive/", expensive_files, name="expensive_files"),
    path("rich-groups/", rich_groups, name="rich_groups"),
    path('<slug:slug>/', file_detail, name='file_detail'),
    path('comment/save-comment/', save_comment, name='save_comment'),
    path('category/<slug:slug>/',show_by_filter,name='filter_shop'),
    path('related-product/<slug:slug>/', related_products, name='related_product'),
    path('feature-list/<slug:slug>/',get_feature_filter,name='feature_list'),
    path('f/group_in_category/',group_in_category,name='group_category'),
]
