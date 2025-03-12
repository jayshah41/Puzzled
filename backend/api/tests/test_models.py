from django.test import TestCase
from api.models import Company, Financial, MarketData, MarketTrends, Directors, Shareholders, CapitalRaises, Projects
from datetime import date, datetime

class CompanyModelTest(TestCase):

    def setUp(self):
        """Setup a sample company for testing"""
        self.company = Company.objects.create(asx_code="XYZ", company_name="XYZ Mining Ltd")

    def test_company_creation(self):
        """Test if a company is created successfully"""
        self.assertEqual(self.company.asx_code, "XYZ")
        self.assertEqual(self.company.company_name, "XYZ Mining Ltd")

    def test_asx_code_unique(self):
        """Test ASX code uniqueness constraint"""
        with self.assertRaises(Exception):  
            Company.objects.create(asx_code="XYZ", company_name="Duplicate Company")


class FinancialModelTest(TestCase):

    def setUp(self):
        """Setup sample financial data for a company"""
        self.company = Company.objects.create(asx_code="ABC", company_name="ABC Resources")
        self.financial = Financial.objects.create(
            asx_code=self.company,
            period="Q1 2025",
            ann_date=date.today(),
            net_operating_cash_flow=500000.00,
            exploration_spend=100000.00
        )

    def test_financial_entry_creation(self):
        """Test if financial entry is correctly created"""
        self.assertEqual(self.financial.period, "Q1 2025")
        self.assertEqual(self.financial.net_operating_cash_flow, 500000.00)
        self.assertEqual(self.financial.exploration_spend, 100000.00)

    def test_foreign_key_company(self):
        """Ensure Financial model links to the correct company"""
        self.assertEqual(self.financial.asx_code.asx_code, "ABC")


class MarketDataModelTest(TestCase):

    def setUp(self):
        """Setup sample market data for testing"""
        self.company = Company.objects.create(asx_code="DEF", company_name="DEF Mining Ltd")
        self.market_data = MarketData.objects.create(
            asx_code=self.company,
            changed=datetime.now(),
            market_cap=1500000.00,
            bank_balance=500000.00
        )

    def test_market_data_creation(self):
        """Test market data is saved correctly"""
        self.assertEqual(self.market_data.market_cap, 1500000.00)
        self.assertEqual(self.market_data.bank_balance, 500000.00)


class MarketTrendsModelTest(TestCase):

    def setUp(self):
        """Setup sample market trends for testing"""
        self.company = Company.objects.create(asx_code="GHI", company_name="GHI Resources")
        self.market_trend = MarketTrends.objects.create(
            asx_code=self.company,
            market_cap=2000000.00,
            trade_value=50000.00,
            total_shares=100000.00,
            new_price=5.00,
            previous_price=4.50,
            week_price_change=0.50
        )

    def test_market_trends_creation(self):
        """Test market trends data is saved correctly"""
        self.assertEqual(self.market_trend.market_cap, 2000000.00)
        self.assertEqual(self.market_trend.trade_value, 50000.00)
        self.assertEqual(self.market_trend.new_price, 5.00)


class DirectorsModelTest(TestCase):

    def setUp(self):
        """Setup sample director data"""
        self.company = Company.objects.create(asx_code="JKL", company_name="JKL Mining Ltd")
        self.director = Directors.objects.create(
            asx_code=self.company,
            contact="John Doe",
            base_remuneration=100000.00,
            total_remuneration=120000.00
        )

    def test_director_creation(self):
        """Test if director data is stored correctly"""
        self.assertEqual(self.director.contact, "John Doe")
        self.assertEqual(self.director.base_remuneration, 100000.00)


class ShareholdersModelTest(TestCase):

    def setUp(self):
        """Setup sample shareholder data"""
        self.company = Company.objects.create(asx_code="MNO", company_name="MNO Mining Ltd")
        self.shareholder = Shareholders.objects.create(
            asx_code=self.company,
            entity="XYZ Holdings",
            value=1000000.00,
            transaction_type="Purchase"
        )

    def test_shareholder_creation(self):
        """Test if shareholder data is saved correctly"""
        self.assertEqual(self.shareholder.entity, "XYZ Holdings")
        self.assertEqual(self.shareholder.value, 1000000.00)


class CapitalRaisesModelTest(TestCase):

    def setUp(self):
        """Setup sample capital raises data"""
        self.company = Company.objects.create(asx_code="PQR", company_name="PQR Mining")
        self.capital_raise = CapitalRaises.objects.create(
            asx_code=self.company,
            bank_balance=500000.00,
            amount=200000.00,
            raise_type="Equity",
            date=date.today()
        )

    def test_capital_raises_creation(self):
        """Test if capital raises data is stored correctly"""
        self.assertEqual(self.capital_raise.amount, 200000.00)
        self.assertEqual(self.capital_raise.raise_type, "Equity")


class ProjectsModelTest(TestCase):

    def setUp(self):
        """Setup sample project data"""
        self.company = Company.objects.create(asx_code="STU", company_name="STU Mining Ltd")
        self.project = Projects.objects.create(
            asx_code=self.company,
            commodity="Gold",
            project_name="Gold Mine A",
            market_cap=5000000.00
        )

    def test_project_creation(self):
        """Test if project data is saved correctly"""
        self.assertEqual(self.project.commodity, "Gold")
        self.assertEqual(self.project.project_name, "Gold Mine A")
