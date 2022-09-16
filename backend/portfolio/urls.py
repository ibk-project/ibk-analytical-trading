from django.urls import include, path
from portfolio import views 

urlpatterns = [
    path('result',views.get_portfolio_output),
    path('top_pick', views.get_top_output),
    path('today',views.get_sector_output)
]
