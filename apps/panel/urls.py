from django.urls import path
from . import views

app_name='panel'

urlpatterns = [

   path('panel',views.dashboard_view,name='panel'),
   path('order-list/',views.user_orders_list_view,name='order-list'),
   path('order-list/',views.user_orders_list_view,name='order-list'),
   path('order-detail/<int:order_id>/',views.order_detail_view,name='order-detail'),
   path('download/<int:order_id>/<int:file_id>/', views.download_file_view, name='download_file'),

]