from django.core.management import call_command
from django.test import TestCase
from api.models import (
    Company, Financial, MarketData, MarketTrends,
    Directors, Shareholders, CapitalRaises, Projects
)

class SeederTest(TestCase):

    def test_seed_data(self):
        call_command("seed")

        company_count = Company.objects.count()
        self.assertTrue(company_count > 0, "No companies were created")

        financial_count = Financial.objects.count()
        self.assertTrue(financial_count > 0, "No financial records were created")

        market_data_count = MarketData.objects.count()
        self.assertTrue(market_data_count > 0, "No market data records were created")

        market_trends_count = MarketTrends.objects.count()
        self.assertTrue(market_trends_count > 0, "No market trends were created")

        directors_count = Directors.objects.count()
        self.assertTrue(directors_count > 0, "No directors were created")

        shareholders_count = Shareholders.objects.count()
        self.assertTrue(shareholders_count > 0, "No shareholders were created")

        capital_raises_count = CapitalRaises.objects.count()
        self.assertTrue(capital_raises_count > 0, "No capital raises were created")

        projects_count = Projects.objects.count()
        self.assertTrue(projects_count > 0, "No projects were created")
