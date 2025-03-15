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
                "phone_number": "+61 (4) 0555 1055",
                "country": "Australia",
                "state": "Western Australia",
                "commodities": ["Gold", "Lithium", "Iron Ore"],
                "tier_level": 2,
                "user_type": "admin",
            },
            {
                "email": "client1@example.com",
                "username": "client1",
                "password": "puzzled",
                "phone_number": "07422783642",
                "country": "UK",
                "state": "Hertfordshire",
                "commodities": ["Aluminum", "Coal", "Cobalt"],
                "tier_level": 1,
                "user_type": "client",
            },
            {
                "email": "client2@example.com",
                "username": "client2",
                "password": "puzzled",
                "phone_number": "07952354725",
                "country": "Eswatini",
                "state": "Manzini",
                "commodities": ["Uranium", "Vanadium", "Zinc"],
                "tier_level": 0,
                "user_type": "client",
            },
        ]

        for data in users_data:
            user, _ = User.objects.get_or_create(
                email=data["email"],
                username=data["username"],
                password=make_password(data["password"]),
                phone_number=data["phone_number"],
                country=data["country"],
                state=data["state"],
                commodities=data["commodities"],
                tier_level=data["tier_level"],
                user_type=data["user_type"],
            )
            self.stdout.write(self.style.SUCCESS(f"Created user: {user.email}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded users!"))