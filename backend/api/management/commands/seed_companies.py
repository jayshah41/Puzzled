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

    COMMODITY_LIST = [
        "Gold", "Silver", "Copper", "Zinc", "Nickel", "Lithium", "Cobalt",
        "Iron Ore", "Bauxite", "Manganese", "Uranium", "Graphite", "Tin",
        "Platinum", "Coal", "Lead", "Titanium", "Vanadium"
    ]

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...\n")

        self.create_companies()
        self.create_financials()
        self.create_market_data()
        self.create_market_trends()
        self.create_directors()
        self.create_shareholders()
        self.create_capital_raises()
        self.create_projects()

        self.stdout.write(self.style.SUCCESS("\nDatabase seeding completed!"))

    def create_companies(self):
        asx_codes = self.generate_unique_asx_codes(self.COMPANY_COUNT)
        companies = [
            Company(asx_code=asx_codes[i], company_name=fake.company())
            for i in range(self.COMPANY_COUNT)
        ]
        Company.objects.bulk_create(companies)
        self.stdout.write(self.style.SUCCESS(f"{self.COMPANY_COUNT} companies seeded successfully."))

    def create_financials(self):
        companies = list(Company.objects.all())
        financials = []

        for company in companies:
            for _ in range(self.FINANCIAL_RECORDS_PER_COMPANY):
                period = f"202{random.randint(0, 4)}Q{random.randint(1, 4)}"
                if not Financial.objects.filter(asx_code=company, period=period).exists():
                    financials.append(Financial(
                        asx_code=company,
                        period=period,
                        ann_date=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                        net_operating_cash_flow=round(random.uniform(5e6, 2e8), 2),
                        exploration_spend=round(random.uniform(5e5, 1.5e7), 2),
                        development_production_spend=round(random.uniform(2e6, 5e7), 2),
                        staff_costs=round(random.uniform(1e6, 1e7), 2),
                        admin_costs=round(random.uniform(5e5, 5e6), 2),
                        other_costs=round(random.uniform(2e4, 1e5), 2),
                        net_cash_invest=round(random.uniform(-2e5, 2e5), 2),
                        cashflow_total=round(random.uniform(1e6, 3e6), 2),
                        debt=round(random.uniform(0, 2e8), 2),
                        bank_balance=round(random.uniform(1e6, 1e8), 2),
                        market_cap=round(random.uniform(5e7, 2e9), 2),
                        forecast_net_operating=round(random.uniform(1e6, 4e6), 2),
                    ))

        Financial.objects.bulk_create(financials)
        self.stdout.write(self.style.SUCCESS("Financial records seeded successfully."))

    def create_market_data(self):
        companies = list(Company.objects.all())
        market_data = []

        for company in companies:
            market_data.append(MarketData(
                asx_code=company,
                changed=make_aware(datetime.now() - timedelta(days=random.randint(1, 90))),
                market_cap=round(random.uniform(1e7, 5e7), 2),
                debt=round(random.uniform(1e6, 4e6), 2),
                bank_balance=round(random.uniform(1e6, 5e6), 2),
                enterprise_value=round(random.uniform(1e8, 5e9), 2),
                ev_resource_per_ounce_ton=round(random.uniform(50, 500), 2),
            ))

        MarketData.objects.bulk_create(market_data)
        self.stdout.write(self.style.SUCCESS("Market data records seeded successfully."))

    def create_market_trends(self):
        companies = list(Company.objects.all())
        trends = []

        for company in companies:
            new_price = round(random.uniform(0.05, 10), 2)
            previous_price = round(new_price * random.uniform(0.8, 1.2), 2)

            trends.append(MarketTrends(
                asx_code=company,
                market_cap=round(random.uniform(1e7, 5e7), 2),
                trade_value=round(random.uniform(1e6, 2e6), 2),
                total_shares=random.randint(int(1e5), int(1e7)),
                new_price=new_price,
                previous_price=previous_price,
                week_price_change=round(random.uniform(-20, 20), 2),
                month_price_change=round(random.uniform(-40, 40), 2),
                year_price_change=round(random.uniform(-100, 200), 2),
            ))

        MarketTrends.objects.bulk_create(trends)
        self.stdout.write(self.style.SUCCESS("Market trends seeded successfully."))

    def create_directors(self):
        companies = list(Company.objects.all())
        directors = [
            Directors(
                asx_code=company,
                contact=fake.name(),
                priority_commodities={"commodities": random.sample(self.COMMODITY_LIST, k=random.randint(1, 3))},
                base_remuneration=round(random.uniform(2e5, 1e6), 2),
                total_remuneration=round(random.uniform(3e5, 2e6), 2)
            )
            for company in companies
        ]

        Directors.objects.bulk_create(directors)
        self.stdout.write(self.style.SUCCESS("Directors seeded successfully."))

    def create_shareholders(self):
        companies = list(Company.objects.all())
        shareholders = []

        for company in companies:
            for _ in range(self.SHAREHOLDER_RECORDS_PER_COMPANY):
                shareholders.append(Shareholders(
                    asx_code=company,
                    entity=fake.company(),
                    value=round(random.uniform(1e5, 5e7), 2),
                    project_commodities=random.choice(self.COMMODITY_LIST),
                    project_area=fake.city(),
                    transaction_type=random.choice(["Buy", "Sell"]),
                    ann_date=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                ))

        Shareholders.objects.bulk_create(shareholders)
        self.stdout.write(self.style.SUCCESS("Shareholders seeded successfully."))

    def create_capital_raises(self):
        companies = list(Company.objects.all())
        capital_raises = [
            CapitalRaises(
                asx_code=company,
                bank_balance=round(random.uniform(1e6, 5e6), 2),
                date=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                amount=round(random.uniform(1e6, 2e8), 2),
                price=round(random.uniform(0.01, 5), 2),
                raise_type=random.choice(["Placement", "Rights Issue"]),
                priority_commodities={"commodities": random.sample(self.COMMODITY_LIST, k=random.randint(1, 3))},
            ) for company in companies
        ]

        CapitalRaises.objects.bulk_create(capital_raises)
        self.stdout.write(self.style.SUCCESS("Capital raises seeded successfully."))

    def create_projects(self):
        companies = list(Company.objects.all())
        projects = []

        for company in companies:
            for _ in range(self.PROJECT_RECORDS_PER_COMPANY):
                projects.append(Projects(
                    asx_code=company,
                    commodity=random.choice(self.COMMODITY_LIST),
                    activity_date_per_day=make_aware(datetime.now() - timedelta(days=random.randint(1, 365))),
                    activity=fake.sentence(),
                    project_name=fake.company(),
                    intersect=round(random.uniform(0.1, 10), 2),
                    market_cap=round(random.uniform(1e7, 5e7), 2),
                    grade=round(random.uniform(0.5, 30), 2),
                    depth=round(random.uniform(20, 1000), 2),
                    percentage_per_metre=round(random.uniform(0.1, 25), 2)
                ))

        Projects.objects.bulk_create(projects)
        self.stdout.write(self.style.SUCCESS("Projects seeded successfully."))

    def generate_unique_asx_codes(self, n):
        asx_codes = set()
        while len(asx_codes) < n:
            length = random.choice([3, 4, 5])
            asx_code = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=length))
            asx_codes.add(asx_code)
        return list(asx_codes)
