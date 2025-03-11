from rest_framework import serializers
from .models import (
    Company, Financial, MarketData, MarketTrends, Directors, 
    Shareholders, CapitalRaises, Projects
)

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class FinancialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financial
        fields = '__all__'

class MarketDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketData
        fields = '__all__'

class MarketTrendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketTrends
        fields = '__all__'

class DirectorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Directors
        fields = '__all__'

class ShareholdersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shareholders
        fields = '__all__'

class CapitalRaisesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapitalRaises
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'
