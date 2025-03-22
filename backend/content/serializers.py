from .models import EditableContent, NewsCard
from rest_framework import serializers

class EditableContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EditableContent
        fields = ['component', 'section', 'text_value']

class NewsCardSerializer(serializers.ModelSerializer):
    paragraphs_list = serializers.SerializerMethodField()
    
    class Meta:
        model = NewsCard
        fields = ['id', 'order', 'category', 'date', 'title', 'paragraphs', 'paragraphs_list', 'link', 'created_at', 'updated_at']
    
    def get_paragraphs_list(self, obj):
        return obj.paragraphs.split('#') if obj.paragraphs else []