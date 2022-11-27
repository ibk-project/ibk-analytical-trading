from django.urls import path
from model import views

urlpatterns = [
    path('market/feature', views.market_feature_collect),
    path('market/model/<int:point_num>', views.market_model),

    path('sector/feature/<int:sector_code>', views.sector_feature),
    path('sector/feature/all', views.sector_feature_all),
    path('sector/feature/topn', views.sector_feature_topn),
    path('sector/model/<int:sector_code>', views.sector_model),
    path('sector/model/all', views.sector_model_all),
    path('sector/model/topn', views.sector_model_topn),
]