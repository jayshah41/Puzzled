from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from app.models import User

class Command(BaseCommand):

    def handle(self, *args, **options):
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

        self.stdout.write(self.style.SUCCESS("Successfully seeded users!"))