from django.test import TestCase
from content.models import EditableContent
from content.serializers import EditableContentSerializer

class EditableContentSerializerTest(TestCase):
    def test_serialization(self):
        content = EditableContent.objects.create(
            component="Hero",
            section="title",
            text_value="MakCorp modernized investments."
        )
        serializer = EditableContentSerializer(content)
        self.assertEqual(serializer.data["component"], "Hero")
        self.assertEqual(serializer.data["section"], "title")
        self.assertEqual(serializer.data["text_value"], "MakCorp modernized investments.")