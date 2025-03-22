from django.apps import apps
from django.test import TestCase
from content.apps import ContentConfig

class ContentConfigTest(TestCase):
    def test_apps(self):
        self.assertEqual(ContentConfig.name, "content")
        self.assertEqual(apps.get_app_config("content").name, "content")