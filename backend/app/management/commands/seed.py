from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from app.models import User
from app.models import EditableContent

class Command(BaseCommand):

    def handle(self, *args, **options):
        self.create_users()
        self.create_editable_content()


    def create_users(self):
        print("Seeding users...")

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
            user = User(
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
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user: {user.email}"))


    def create_editable_content(self):
        print("Seeding editable content...")

        content_data = [
            {
                "component": "Hero",
                "section": "title",
                "text_value": "MakCorp has modernised how our clients invest in Mining, Oil & Gas."
            },
            {
                "component": "Hero",
                "section": "intro",
                "text_value": "Compare & analyse ASX resource companies, including"
            },
            {
                "component": "Hero",
                "section": "bulletPoints",
                "text_value": "Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more#Over 8,500 directors including remuneration and shareholdings#Over 2,700 capital raises and their information#Over 29,000 Top 20 shareholders transactions#Financials including quarterlies, half yearly and annual"
            },
        ]

        for data in content_data:
            content = EditableContent(
                component=data["component"],
                section=data["section"],
                text_value=data["text_value"]
            )
            content.save()
            self.stdout.write(self.style.SUCCESS(f"Created content for component: {content.component}, section: {content.section}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded users and editable content"))