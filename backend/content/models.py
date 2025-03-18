from django.db import models

class EditableContent(models.Model):
    component = models.TextField(max_length=100)
    section = models.TextField(max_length=100)
    text_value = models.TextField()