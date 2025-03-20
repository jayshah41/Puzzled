from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model() 


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'commodities', 'tier_level']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)  

        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        instance = self.Meta.model(**validated_data)  
        if password:
            instance.set_password(password)  
        instance.save()

        return instance
        
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password is not None:
            instance.set_password(password)
            
        instance.save()
        return instance