from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, FinancialViewSet, MarketDataViewSet, 
    MarketTrendsViewSet, DirectorsViewSet, ShareholdersViewSet, 
    CapitalRaisesViewSet, ProjectsViewSet
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'financials', FinancialViewSet)
router.register(r'market-data', MarketDataViewSet)
router.register(r'market-trends', MarketTrendsViewSet)
router.register(r'directors', DirectorsViewSet)
router.register(r'shareholders', ShareholdersViewSet)
router.register(r'capital-raises', CapitalRaisesViewSet)
router.register(r'projects', ProjectsViewSet)

urlpatterns = [
    path('', include(router.urls)),  # No 'api/' prefix here
]
