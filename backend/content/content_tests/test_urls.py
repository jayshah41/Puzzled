from django.test import SimpleTestCase
from django.urls import reverse, resolve
from content.views import EditableContentView, EditableContentUpdateView

class TestUrls(SimpleTestCase):
    def test_editable_content_url(self):
        url = reverse("editable-content-update")
        self.assertEqual(resolve(url).func.view_class, EditableContentUpdateView)

    def test_editable_content_list_url(self):
        url = reverse("editable-content")
        self.assertEqual(resolve(url).func.view_class, EditableContentView)