from django.core.management.base import BaseCommand
from django.db import connection
from api.models import Company, Financial, MarketData, MarketTrends, Directors, Shareholders, CapitalRaises, Projects

class Command(BaseCommand):
    """Automation command to unseed the database."""
    
    help = "Removes all seeded data from the database"

    def handle(self, *args, **options):
        """Unseed the database and reset indices."""
        print("Unseeding database...")

        models = [Company, Financial, MarketData, MarketTrends, 
                  Directors, Shareholders, CapitalRaises, Projects]
        
        for model in models:
            model.objects.all().delete()

        self.reset_id(models)

        print("Unseeding and index reset completed!")

    def reset_id(self, models):
        """Reset primary key for models."""
        with connection.cursor() as cursor:
            for model in models:
                table_name = model._meta.db_table
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table_name}';")
