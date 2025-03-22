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

class AggregatedCompanySerializer(serializers.ModelSerializer):
    bank_balance = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()
    priority_commodity = serializers.SerializerMethodField()
    project_area = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['asx_code', 'company_name', 'bank_balance', 'value', 'priority_commodity', 'project_area']

    def get_bank_balance(self, obj):
        raise_obj = obj.capital_raises.first()
        return raise_obj.bank_balance if raise_obj else None

    def get_value(self, obj):
        shareholder = obj.shareholders.first()
        return shareholder.value if shareholder else None

    def get_priority_commodity(self, obj):
        project = obj.projects.first()
        return project.commodity if project else None

    def get_project_area(self, obj):
        shareholder = obj.shareholders.first()
        return shareholder.project_area if shareholder else None

