from .models import EditableContent
from rest_framework import serializers

class EditableContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EditableContent
        fields = ['component', 'section', 'text_value']