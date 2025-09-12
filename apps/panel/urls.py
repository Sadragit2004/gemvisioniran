from django.urls import path
from . import views

app_name='panel'

urlpatterns = [

   path('panel',views.dashboard_view,name='panel'),
   path('order-list/',views.user_orders_list_view,name='order-list')

]