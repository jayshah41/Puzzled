from django.test import TestCase
from rest_framework.test import APIClient
from content.models import EditableContent

class EditableContentViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        EditableContent.objects.create(component="Hero", section="title", text_value="Test Title")

    def test_list_editable_content(self):
        response = self.client.get("/editable-content/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)