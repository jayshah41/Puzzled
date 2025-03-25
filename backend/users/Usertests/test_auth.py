from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .test_base import BaseUserTestCase


User = get_user_model()

class AuthenticationTests(BaseUserTestCase):

    def test_register_user(self):
        """Test successful user registration with valid data."""
        new_user_data = {
            'email': 'newuser@example.com',
            'password': 'testpassword123',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '9876543210',
        }
        
        response = self.client.post('/register/', new_user_data, format='json')
        
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], new_user_data['email'])

    def test_login_user(self):
        """Test successful user login with valid credentials."""
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
        """Test unsuccessful login attempt with invalid password."""
        url = reverse('login')
        data = {
            "email": self.user_data['email'],
            "password": "wrongpassword"
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        
    def test_register_missing_required_fields(self):
        """Test registration with missing required fields."""
        incomplete_data = {
            'email': 'incomplete@example.com',
        }
    
        response = self.client.post('/register/', incomplete_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_duplicate_email(self):
        """Test registration with an existing email."""
        duplicate_data = {
            'email': self.user_data['email'],  
            'username': 'newusername',
            'password': 'newpassword123'
        }
        
        response = self.client.post('/register/', duplicate_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Email is already taken', response.data['error'])

    def test_register_duplicate_username(self):
        """Test registration with an existing username."""
        duplicate_data = {
            'email': 'different@example.com',
            'username': self.user_data['username'],  
            'password': 'newpassword123'
        }
        
        response = self.client.post('/register/', duplicate_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Username is already taken', response.data['error'])