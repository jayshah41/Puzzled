from django.contrib.auth import get_user_model
from .models import EditableContent
from rest_framework import serializers

User = get_user_model()  # Dynamically retrieve the custom User model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'first_name', 'last_name', 'country', 'state', 'commodities', 'tier_level']
