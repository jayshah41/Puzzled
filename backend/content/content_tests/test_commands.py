from django.core.management import call_command
from django.test import TestCase
from content.models import EditableContent

class SeedContentCommandTest(TestCase):
    def test_seed_content(self):
        call_command("seed_content")
        self.assertTrue(EditableContent.objects.exists())