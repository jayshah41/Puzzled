from django.test import TestCase
from content.models import EditableContent

class EditableContentModelTest(TestCase):
    def test_create_editable_content(self):
        content = EditableContent.objects.create(
            component="Hero",
            section="title",
            text_value="MakCorp has modernised how our clients invest."
        )
        self.assertEqual(content.component, "Hero")
        self.assertEqual(content.section, "title")
        self.assertEqual(content.text_value, "MakCorp has modernised how our clients invest.")