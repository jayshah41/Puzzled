from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()  # Dynamically retrieve the custom User model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'country', 'state', 'commodities', 'tier_level', 'user_type', 'is_admin', 'last_seen']
    
    # Optionally, add validation to ensure that `commodities` is a list with a maximum of 3 items
    def validate_commodities(self, value):
        if len(value) > 3:
            raise serializers.ValidationError("You can only specify up to 3 commodities.")
        return value
