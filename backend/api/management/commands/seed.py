from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Run all seeders from multiple apps'

    def handle(self, *args, **kwargs):
        call_command('seed_users')  
        call_command('seed_companies')
        call_command('seed_content')
        call_command('seed_companies')  
        
        self.stdout.write(self.style.SUCCESS('all seeders run'))
