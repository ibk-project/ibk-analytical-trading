from django.urls import path
from index import views

urlpatterns = [
    path('', views.get_index),
    path('update/', views.get_data)
]