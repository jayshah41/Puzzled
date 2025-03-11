from django.db import models

# Represents a company listed on the Australian Stock Exchange
class Company(models.Model):
    asx_code = models.CharField(max_length=5, primary_key=True, unique=True)
    company_name = models.CharField(max_length=255)

    def __str__(self):
        return self.company_name
    
# Stores financial data for companies
class Financial(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='financials')
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

# Represents Market Data
class MarketData(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='market_data')
    changed = models.DateTimeField()
    market_cap = models.FloatField(null=True, blank=True)
    debt = models.FloatField(null=True, blank=True)
    bank_balance = models.FloatField(null=True, blank=True)
    enterprise_value = models.FloatField(null=True, blank=True)
    ev_resource_per_ounce_ton = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.asx_code.asx_code} - {self.changed}"

# Represents trends in market data over time 
class MarketTrends(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='market_trend')
    market_cap = models.FloatField(null=True, blank=True)
    trade_value = models.FloatField(null=True, blank=True)
    total_shares = models.FloatField(null=True, blank=True)
    new_price = models.FloatField(null=True, blank=True)
    previous_price = models.FloatField(null=True, blank=True)
    week_price_change = models.FloatField(null=True, blank=True)
    month_price_change = models.FloatField(null=True, blank=True)
    year_price_change = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.asx_code.asx_code} - {self.market_cap}"

# Stores details about company directors and their compensation
class Directors(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='directors')
    contact = models.CharField(max_length=255)
    priority_commodities = models.JSONField(null = True, blank = True)
    base_remuneration = models.FloatField(null=True, blank=True)
    total_remuneration = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.contact

# Represents major shareholders and their holdings 
class Shareholders(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='shareholders')
    entity = models.CharField(max_length=255)
    value = models.FloatField(null=True, blank=True)
    project_commodities = models.CharField(max_length=255)
    project_area = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=255)
    ann_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.entity
    
# Stores data about capital raises
class CapitalRaises(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='capital_raises')
    bank_balance = models.FloatField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    amount = models.FloatField(null=True, blank=True)
    price = models.FloatField(null=True, blank=True)
    raise_type =  models.CharField(max_length=50)
    priority_commodities = models.JSONField(null = True, blank = True)
    
    def __str__(self):
        return f"{self.asx_code.asx_code} - {self.bank_balance}"

# Stores details about mining/exploration projects
class Projects(models.Model):
    asx_code = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='projects') 
    commodity = models.CharField(max_length=255)
    activity_date_per_day = models.DateField(null=True, blank=True)
    activity = models.CharField(max_length=255)
    project_name = models.CharField(max_length=255)
    intersect = models.FloatField(null=True, blank=True)
    market_cap = models.FloatField(null=True, blank=True)
    grade = models.FloatField(null=True, blank=True)
    depth = models.FloatField(null=True, blank=True)
    percentage_per_metre = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.commodity


