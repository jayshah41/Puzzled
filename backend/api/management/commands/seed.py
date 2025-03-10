import random
from faker import Faker
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from django.core.management.base import BaseCommand
from api.models import Company, Financial, MarketData, MarketTrends, Directors, Shareholders, CapitalRaises, Projects

fake = Faker()

class Command(BaseCommand):
    COMPANY_COUNT = 100
    FINANCIAL_RECORDS_PER_COMPANY = 4
    SHAREHOLDER_RECORDS_PER_COMPANY = 5
    PROJECT_RECORDS_PER_COMPANY = 2
    help = "Seeds the database with company-related data"

    def handle(self, *args, **kwargs):
        print("Seeding database...")

        self.create_companies()
        self.create_financials()
        self.create_market_data()
        self.create_market_trends()
        self.create_directors()
        self.create_shareholders()
        self.create_capital_raises()
        self.create_projects()

        print("Seeding completed!")

    def create_companies(self):
        """Generate unique companies with ASX codes."""
        asx_codes = self.generate_unique_asx_codes(self.COMPANY_COUNT)
        companies = [
            Company(asx_code=asx_codes[i], company_name=fake.company())
            for i in range(self.COMPANY_COUNT)
        ]

        Company.objects.bulk_create(companies)
        print(f"{self.COMPANY_COUNT} Companies seeded successfully!")

    def create_financials(self):
        """Generate multiple financial records per company."""
        companies = list(Company.objects.all())
        financials = []

        for i, company in enumerate(companies):
            for _ in range(self.FINANCIAL_RECORDS_PER_COMPANY):
                period = random.choice(["2024Q1", "2024Q2", "2024Q3", "2024Q4"])

                if not Financial.objects.filter(asx_code=company, period=period).exists():
                    financials.append(Financial(
                        asx_code=company,
                        period=period,
                        ann_date=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                        net_operating_cash_flow=round(random.uniform(1e6, 5e6), 2),
                        exploration_spend=round(random.uniform(1e5, 5e5), 2),
                        development_production_spend=round(random.uniform(2e5, 8e5), 2),
                        staff_costs=round(random.uniform(5e4, 3e5), 2),
                        admin_costs=round(random.uniform(1e4, 2e5), 2),
                        other_costs=round(random.uniform(2e4, 1e5), 2),
                        net_cash_invest=round(random.uniform(-2e5, 2e5), 2),
                        cashflow_total=round(random.uniform(1e6, 3e6), 2),
                        bank_balance=round(random.uniform(1e6, 5e6), 2),
                        debt=round(random.uniform(1e6, 4e6), 2),
                        market_cap=round(random.uniform(1e7, 5e7), 2),
                        forecast_net_operating=round(random.uniform(1e6, 4e6), 2),
                    ))

        Financial.objects.bulk_create(financials)
        print("\nFinancial records seeded successfully!")

    def create_market_data(self):
        """Generate market data for each company."""
        companies = list(Company.objects.all())
        market_data = []

        for i, company in enumerate(companies):
            market_data.append(MarketData(
                asx_code=company,
                changed=make_aware(datetime.now() - timedelta(days=random.randint(1, 90))),
                market_cap=round(random.uniform(1e7, 5e7), 2),
                debt=round(random.uniform(1e6, 4e6), 2),
                bank_balance=round(random.uniform(1e6, 5e6), 2),
                enterprise_value=round(random.uniform(2e7, 6e7), 2),
                ev_resource_per_ounce_ton=round(random.uniform(10, 200), 2),
            ))

        MarketData.objects.bulk_create(market_data)
        print("\nMarket data records seeded successfully!")

    def create_market_trends(self):
        """Generate market trend data."""
        companies = list(Company.objects.all())
        trends = []

        for company in companies:
            trends.append(MarketTrends(
                asx_code=company,
                market_cap=round(random.uniform(1e7, 5e7), 2),
                trade_value=round(random.uniform(1e6, 2e6), 2),
                total_shares=random.randint(int(1e5), int(1e7)),
                new_price=round(random.uniform(1, 200), 2),
                previous_price=round(random.uniform(1, 200), 2),
                week_price_change=round(random.uniform(-10, 10), 2),
                month_price_change=round(random.uniform(-20, 20), 2),
                year_price_change=round(random.uniform(-50, 50), 2),
            ))

        MarketTrends.objects.bulk_create(trends)
        print("\nMarket trends seeded successfully!")


    def create_directors(self):
        """Generate directors for each company."""
        companies = list(Company.objects.all())
        directors = [
            Directors(
                asx_code=company,
                contact=fake.name(),
                priority_commodities={"commodities": random.sample(["Gold", "Silver", "Copper"], k=2)},
                base_remuneration=round(random.uniform(1e5, 5e5), 2),
                total_remuneration=round(random.uniform(2e5, 7e5), 2),
            )
            for company in companies
        ]

        Directors.objects.bulk_create(directors)
        print("\nDirectors seeded successfully!")

    def create_shareholders(self):
        """Generate shareholder data."""
        companies = list(Company.objects.all())
        shareholders = []

        for company in companies:
            for _ in range(self.SHAREHOLDER_RECORDS_PER_COMPANY):
                shareholders.append(Shareholders(
                    asx_code=company,
                    entity=fake.company(),
                    value=round(random.uniform(1e5, 2e6), 2),
                    project_commodities=fake.word(),
                    project_area=fake.city(),
                    transaction_type=random.choice(["Buy", "Sell"]),
                    ann_date=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                ))

        Shareholders.objects.bulk_create(shareholders)
        print("\nShareholders seeded successfully!")

    def create_capital_raises(self):
        """Generate capital raises data."""
        companies = list(Company.objects.all())
        capital_raises = [
            CapitalRaises(
                asx_code=company,
                bank_balance=round(random.uniform(1e6, 5e6), 2),
                date=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                amount=round(random.uniform(1e5, 5e6), 2),
                price=round(random.uniform(0.1, 5), 2),
                raise_type=random.choice(["Placement", "Rights Issue"]),
                priority_commodities={"commodities": random.sample(["Gold", "Silver", "Copper"], k=2)},
            ) for company in companies
        ]

        CapitalRaises.objects.bulk_create(capital_raises)
        print("\nCapital raises seeded successfully!")

    def create_projects(self):
        """Generate mining/exploration projects."""
        companies = list(Company.objects.all())
        projects = []

        for company in companies:
            for _ in range(self.PROJECT_RECORDS_PER_COMPANY):
                projects.append(Projects(
                    asx_code=company,
                    commodity=random.choice(["Gold", "Silver", "Copper"]),
                    activity_date_per_day=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                    activity=fake.sentence(),
                    project_name=fake.company(),
                    intersect=round(random.uniform(0.1, 10), 2),
                    market_cap=round(random.uniform(1e7, 5e7), 2),
                    grade=round(random.uniform(1, 50), 2),
                    depth=round(random.uniform(10, 500), 2),
                    percentage_per_metre=round(random.uniform(0.1, 10), 2),
                ))

        Projects.objects.bulk_create(projects)
        print("\nProjects seeded successfully!")

    def generate_unique_asx_codes(self, n):
        """Generate a set of unique ASX codes with 3 to 5 letters."""
        asx_codes = set()
        while len(asx_codes) < n:
            length = random.choice([3, 4, 5])
            asx_code = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=length))
            asx_codes.add(asx_code)
        return list(asx_codes)
