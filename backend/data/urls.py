from django.urls import include, path
from data import views 

urlpatterns = [
    path('index/',include([
        path('all-data',views.get_index),#Get시 모든 index 재추출 및 저장, Post시 특정 값들만 추출 후 제공
        path('one-data',views.get_one_index),
        path('get',views.get_index_front),
        ])),
    path('commodity/',include([
        path('all-data',views.get_commodity),
        path('one-data',views.get_one_commodity),
        ])),
    path('stock/',include([
        path('all-data',views.get_stock),
        path('one-data',views.get_one_stock),
        ])),
]
