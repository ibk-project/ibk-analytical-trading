from django.urls import include, path
from portfolio import views 

urlpatterns = [
    path('result',views.get_portfolio_output),
]
