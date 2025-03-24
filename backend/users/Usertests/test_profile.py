from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .test_base import BaseUserTestCase


User = get_user_model()

class ProfileTests(BaseUserTestCase):

    def test_profile_view(self):
        self.authenticate()
        
        url = reverse('profile')  
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertEqual(response.data['first_name'], self.user_data['first_name'])
        self.assertEqual(response.data['last_name'], self.user_data['last_name'])

    def test_update_profile(self):
        """Test updating user profile information."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('update-profile')  
        updated_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone_number': '9876543210'
        }
        
        response = self.client.patch(url, updated_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], updated_data['first_name'])
        self.assertEqual(response.data['last_name'], updated_data['last_name'])
        self.assertEqual(response.data['phone_number'], updated_data['phone_number'])
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, updated_data['first_name'])
        self.assertEqual(self.user.last_name, updated_data['last_name'])
        self.assertEqual(self.user.phone_number, updated_data['phone_number'])

    def test_update_profile_invalid_data(self):
        """Test updating profile with invalid data."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('update-profile')
        invalid_data = {
            'email': 'not_an_email'  
        }
        
        response = self.client.patch(url, invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(len(response.data) > 0)  

    def test_user_string_representation(self):
        """Test the string representation of a User object."""
        user = self.user
        expected_string = f"{user.email} -  (Tier {user.tier_level})"
        self.assertEqual(str(user), expected_string)