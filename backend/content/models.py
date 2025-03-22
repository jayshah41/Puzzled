from django.db import models

class EditableContent(models.Model):
    component = models.TextField(max_length=100)
    section = models.TextField(max_length=100)
    text_value = models.TextField()

class NewsCard(models.Model):
    order = models.IntegerField(default=0)
    category = models.CharField(max_length=100)
    date = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    paragraphs = models.TextField()
    link = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']