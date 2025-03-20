from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from app.serializers import UserSerializer

User = get_user_model()

class UserTests(APITestCase):

    def setUp(self):
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

    def test_register_user(self):
        new_user_data = {
            'email': 'newuser@example.com',
            'password': 'testpassword123',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '9876543210',
        }
        
        response = self.client.post('/register/', new_user_data, format='json')
        
        if response.status_code != status.HTTP_201_CREATED:
            print(response.content)
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], new_user_data['email'])

    def test_login_user(self):
        url = reverse('login')
        data = {
            "email": self.user_data['email'],
            "password": self.user_data['password']
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login(self):
        url = reverse('login')
        data = {
            "email": self.user_data['email'],
            "password": "wrongpassword"
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_serializer_valid_data(self):
        new_user_data = {
            'email': 'serializer@example.com',
            'password': 'testpassword123',
            'username': 'serializeruser',
            'first_name': 'Serial',
            'last_name': 'User',
        }
        user = User.objects.create_user(**new_user_data)
        serializer = UserSerializer(user)
        
        self.assertEqual(serializer.data['email'], new_user_data['email'])
        self.assertEqual(serializer.data['first_name'], new_user_data['first_name'])
        self.assertTrue(user.check_password(new_user_data['password']))
        
       
    def test_serializer_invalid_data(self):
        invalid_data = self.user_data.copy()
        del invalid_data['email']

        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_user_creation(self):
        user = User.objects.create_user(
            email="test2@example.com", 
            username="test2user",
            password="newpassword123", 
            first_name="New", 
            last_name="User"
        )
        self.assertEqual(user.email, "test2@example.com")
        self.assertEqual(user.username, "test2user")
        self.assertTrue(user.check_password("newpassword123"))