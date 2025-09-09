from django.urls import path
from .views import add_to_cart,cart_count,show_item,remove_from_cart

app_name='order'

urlpatterns = [
   path("add/<int:file_id>/", add_to_cart, name="add_to_cart"),
   path("count/", cart_count, name="cart_count"),
   path('get-card/',show_item,name='get_card'),
   path("remove/<int:file_id>/", remove_from_cart, name="remove_from_cart"),

]