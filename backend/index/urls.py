from django.urls import path
from index import views

#미사용
urlpatterns = [
    path('get/', views.get_index),
    path('update/', views.get_data),
]