from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class BaseUserTestCase(APITestCase):
    
    def setUp(self):
        """Set up common test data for all user tests."""
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'password123',
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '1234567890',
            'commodities': ['Gold', 'Copper', 'Silver'],
            'tier_level': 1,
        }
        self.user = User.objects.create_user(**self.user_data)
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')