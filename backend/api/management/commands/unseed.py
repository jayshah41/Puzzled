from django.core.management.base import BaseCommand
from app.models import Company

class Command(BaseCommand):
    """Automation command to unseed the database."""
    
    help = "Removes all seeded data from the database"

    def handle(self, *args, **options):
        """Unseed the database."""
        print("Unseeding database...")

        Company.objects.all().delete()
        

        print("Unseeding completed!")
