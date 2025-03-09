import random
from faker import Faker
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from django.core.management.base import BaseCommand
from app.models import Company, Financial, MarketData

fake = Faker()

class Command(BaseCommand):
    COMPANY_COUNT = 100
    help = "Seeds the database with company-related data"

    def handle(self, *args, **kwargs):
        print("Seeding database...")

        self.create_companies()
        self.create_financials()
        self.create_market_data()

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
        """Generate financial records for each company."""
        companies = list(Company.objects.all())
        financials = []

        for i, company in enumerate(companies):
            financials.append(Financial(
                asx_code=company,
                period=random.choice(["2023Q1", "2023Q2", "2023Q3", "2023Q4"]),
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

            print(f"\rCreating financials: {i + 1}/{len(companies)}", end="")

        Financial.objects.bulk_create(financials)
        print("\n Financial records seeded successfully!")

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

            print(f"\rCreating market data: {i + 1}/{len(companies)}")

        MarketData.objects.bulk_create(market_data)
        print("\n Market data records seeded successfully!")

    def generate_unique_asx_codes(self, n):
        """Generate a set of unique ASX codes with three letters."""
        asx_codes = set()
        while len(asx_codes) < n:
            asx_code = "".join(random.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 3))
            asx_codes.add(asx_code)
        return list(asx_codes)
