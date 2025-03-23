from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
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
    CapitalRaisesSerializer, ProjectsSerializer, AggregatedCompanySerializer
)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated] 

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
            'avg_week_price_change': MarketTrends.objects.aggregate(Avg('week_price_change'))['week_price_change__avg'] or 0,
            'avg_month_price_change': MarketTrends.objects.aggregate(Avg('month_price_change'))['month_price_change__avg'] or 0,
            'avg_year_price_change': MarketTrends.objects.aggregate(Avg('year_price_change'))['year_price_change__avg'] or 0,
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

class CompanyDetailsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Company.objects.prefetch_related(
            'capital_raises',
            'shareholders',
            'projects'
        ).all()

        serializer = AggregatedCompanySerializer(queryset, many=True)
        return Response(serializer.data)
    
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



