from django.db import models

class Company(models.Model):
    asx_code = models.CharField(max_length=5, primary_key=True, unique=True)
    company_name = models.CharField(max_length=255)

    def __str__(self):
        return self.company_name
    
from django.db import models

class Financial(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE)
    period = models.CharField(max_length=50)
    ann_date = models.DateField(null=True, blank=True)
    net_operating_cash_flow = models.FloatField(null=True, blank=True)
    exploration_spend = models.FloatField(null=True, blank=True)
    development_production_spend = models.FloatField(null=True, blank=True)
    staff_costs = models.FloatField(null=True, blank=True)
    admin_costs = models.FloatField(null=True, blank=True)
    other_costs = models.FloatField(null=True, blank=True)
    net_cash_invest = models.FloatField(null=True, blank=True)
    cashflow_total = models.FloatField(null=True, blank=True)
    bank_balance = models.FloatField(null=True, blank=True)
    debt = models.FloatField(null=True, blank=True)
    market_cap = models.FloatField(null=True, blank=True)
    forecast_net_operating = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.asx_code.asx_code} - {self.period}"
    
from django.db import models

class MarketData(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE)
    changed = models.DateTimeField()
    market_cap = models.FloatField(null=True, blank=True)
    debt = models.FloatField(null=True, blank=True)
    bank_balance = models.FloatField(null=True, blank=True)
    enterprise_value = models.FloatField(null=True, blank=True)
    ev_resource_per_ounce_ton = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.asx_code.asx_code} - {self.changed}"
