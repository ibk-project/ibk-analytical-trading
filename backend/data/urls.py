from django.urls import include, path
from data import views 

urlpatterns = [
    path('index/',include([
        path('all-data',views.get_index),#Get시 모든 index 재추출 및 저장, Post시 특정 값들만 추출 후 제공
        path('one-data',views.get_one_index),
        path('get',views.get_index_front),
        path('name-list',views.get_index_name),
        ])),
    path('commodity/',include([
        path('all-data',views.get_commodity),
        path('one-data',views.get_commodity_front),
        #path('one-data',views.get_one_commodity),
        ])),
    path('stock/',include([
        path('all-data',views.get_stock),
        path('stocks',views.get_stocks),
        path('sector-list', views.get_sector_list),
         path('sector-stock', views.get_sector_stock)
        ])),
    path('model/', include([
        path('market', views.get_market_model),
        path('sector/<int:sector_code>', views.get_sector_model),
        path('news', views.get_news_feature)
    ])),
]
