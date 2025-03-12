from rest_framework import viewsets
from .models import (
    Company, Financial, MarketData, MarketTrends, Directors, 
    Shareholders, CapitalRaises, Projects
)
from .serializers import (
    CompanySerializer, FinancialSerializer, MarketDataSerializer, 
    MarketTrendsSerializer, DirectorsSerializer, ShareholdersSerializer, 
    CapitalRaisesSerializer, ProjectsSerializer
)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class FinancialViewSet(viewsets.ModelViewSet):
    queryset = Financial.objects.all()
    serializer_class = FinancialSerializer

class MarketDataViewSet(viewsets.ModelViewSet):
    queryset = MarketData.objects.all()
    serializer_class = MarketDataSerializer

class MarketTrendsViewSet(viewsets.ModelViewSet):
    queryset = MarketTrends.objects.all()
    serializer_class = MarketTrendsSerializer

class DirectorsViewSet(viewsets.ModelViewSet):
    queryset = Directors.objects.all()
    serializer_class = DirectorsSerializer

class ShareholdersViewSet(viewsets.ModelViewSet):
    queryset = Shareholders.objects.all()
    serializer_class = ShareholdersSerializer

class CapitalRaisesViewSet(viewsets.ModelViewSet):
    queryset = CapitalRaises.objects.all()
    serializer_class = CapitalRaisesSerializer

class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all()
    serializer_class = ProjectsSerializer
