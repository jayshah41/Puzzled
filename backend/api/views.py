from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MarketTrends
from django.db.models import Avg
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


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

class MarketStatistics(APIView):
    def get(self, request):
        stats = {
            'ASX_code_count': MarketTrends.objects.values('asx_code').distinct().count(),
            'daily_avg_price_change': MarketTrends.objects.aggregate(Avg('daily_price_change'))['daily_price_change__avg'] or 0,
            'avg_weekly_price_change': MarketTrends.objects.aggregate(Avg('weekly_price_change'))['weekly_price_change__avg'] or 0,
            'avg_monthly_price_change': MarketTrends.objects.aggregate(Avg('monthly_price_change'))['monthly_price_change__avg'] or 0,
            'avg_yearly_price_change': MarketTrends.objects.aggregate(Avg('yearly_price_change'))['yearly_price_change__avg'] or 0,
            'daily_relative_volume_change': MarketTrends.objects.aggregate(Avg('daily_relative_volume_change'))['daily_relative_volume_change__avg'] or 0,
        }
        return Response(stats)

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

@csrf_exempt
def get_tweets(request, username):
    try:
        url = f"https://nitter.privacydev.net/{username}/rss"
        headers = {"User-Agent": "Mozilla/5.0"} 
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return JsonResponse({"rss": response.text})
        else:
            return JsonResponse({"error": "Failed to fetch tweets"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)