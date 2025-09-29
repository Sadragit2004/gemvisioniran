from django.urls import path
from . import views

app_name='course'

urlpatterns = [

    path('',views.main_course,name='course'),
    path('<str:slug>/',views.course_detail,name='detail'),
     path('<uuid:course_id>/rate/', views.submit_rating, name='submit_rating'),
    path('<uuid:course_id>/comment/', views.submit_comment, name='submit_comment'),


]