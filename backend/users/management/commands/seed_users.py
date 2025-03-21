from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from users.models import User
from faker import Faker
import random

class Command(BaseCommand):

    def handle(self, *args, **options):
        fake = Faker()
        self.stdout.write("Seeding users...")

        users_data = [
            {
                "email": "steve@makcorp.com.au",
                "username": "steve",
                "password": "puzzled",
                "first_name": "Steve",
                "last_name": "Rosewell",
                "phone_number": "+61 (4) 0555 1055",
                "country": "Australia",
                "state": "Western Australia",
                "commodities": ["Gold", "Lithium", "Iron Ore"],
                "tier_level": 2
            },
            {
                "email": "johndoe@example.com",
                "username": "johndoe",
                "password": "puzzled",
                "first_name": "John",
                "last_name": "Doe",
                "phone_number": "07422783642",
                "country": "UK",
                "state": "Hertfordshire",
                "commodities": ["Aluminum", "Coal", "Cobalt"],
                "tier_level": 1
            },
            {
                "email": "janedoe@example.com",
                "username": "janedoe",
                "password": "puzzled",
                "first_name": "Jane",
                "last_name": "Doe",
                "phone_number": "07952354725",
                "country": "Eswatini",
                "state": "Manzini",
                "commodities": ["Uranium", "Vanadium", "Zinc"],
                "tier_level": 0
            }
        ]

        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["username"],
                    "password": make_password(data["password"]),
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "phone_number": data["phone_number"],
                    "country": data["country"],
                    "state": data["state"],
                    "commodities": data["commodities"],
                    "tier_level": data["tier_level"],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created user: {user.email}"))
            else:
                self.stdout.write(self.style.WARNING(f"User already exists: {user.email}"))

        self.stdout.write(self.style.SUCCESS('Creating additional 5 admin users (tier 2)...'))
        for i in range(5):
            email = f"admin{i+1}@example.com"
            username = f"admin{i+1}"
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User {email} already exists, skipping...'))
                continue
                
            user = User.objects.create_user(
                email=email,
                username=username,
                password="puzzling",
                first_name=f"admin{i+1}",
                last_name="Admin",
                phone_number=fake.phone_number(),
                country=fake.country(),
                state=fake.state(),
                commodities=random.sample(['Gold', 'Silver', 'Oil', 'Wheat', 'Corn', 'Coffee'], k=random.randint(1, 4)),
                tier_level=2,
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {user.email}"))
        
        self.stdout.write(self.style.SUCCESS('Creating additional 19 tier 1 (paid) users...'))
        for i in range(19):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            username = f"{first_name.lower()}_{last_name.lower()}"
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User {email} already exists, skipping...'))
                continue
                
            user = User.objects.create_user(
                email=email,
                username=username,
                password="puzzling",
                first_name=first_name,
                last_name=last_name,
                phone_number=fake.phone_number(),
                country=fake.country(),
                state=fake.state(),
                commodities=random.sample(['Gold', 'Silver', 'Oil', 'Wheat', 'Corn', 'Coffee'], k=random.randint(1, 3)),
                tier_level=1
            )
            self.stdout.write(self.style.SUCCESS(f"Created paid user: {user.email}"))
        
        self.stdout.write(self.style.SUCCESS('Creating additional 9 tier 0 (basic) users...'))
        for i in range(9):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            username = f"{first_name.lower()}_{last_name.lower()}"
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User {email} already exists, skipping...'))
                continue
                
            user = User.objects.create_user(
                email=email,
                username=username,
                password="puzzling",
                first_name=first_name,
                last_name=last_name,
                phone_number=fake.phone_number(),
                country=fake.country(),
                state=fake.state(),
                commodities=random.sample(['Gold', 'Silver'], k=random.randint(1, 2)),
                tier_level=0
            )
            self.stdout.write(self.style.SUCCESS(f"Created basic user: {user.email}"))
            
        self.stdout.write(self.style.SUCCESS("Successfully seeded all users!"))