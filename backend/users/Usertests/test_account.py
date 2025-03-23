from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .test_base import BaseUserTestCase


User = get_user_model()

class AccountManagementTests(BaseUserTestCase):

    def test_update_password(self):
        """Test updating user password."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('update-profile')  
        password_data = {
            'old_password': 'password123',
            'new_password': 'newpassword456'
        }
        
        response = self.client.patch(url, password_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password updated successfully')
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword456'))

    def test_update_password_invalid_old_password(self):
        """Test updating user password with invalid old password."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('update-profile')  
        password_data = {
            'old_password': 'wrongpassword',
            'new_password': 'newpassword456'
        }
        
        response = self.client.patch(url, password_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('password123'))

    def test_delete_account(self):
        """Test deleting user account."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('delete-account') 
        data = {
            'password': 'password123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Account deleted successfully')
        self.assertEqual(User.objects.filter(email=self.user_data['email']).count(), 0)

    def test_delete_account_invalid_password(self):
        """Test deleting user account with invalid password."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('delete-account') 
        data = {
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        
        self.assertEqual(User.objects.filter(email=self.user_data['email']).count(), 1)

    def test_update_tier(self):
        """Test updating user tier level."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('update-tier') 
        data = {
            'tier_level': 2
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Tier level updated successfully')
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier_level, 2)

    def test_update_tier_invalid_level(self):
        """Test updating user tier level with invalid tier."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        url = reverse('update-tier') 
        data = {
            'tier_level': 5 
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
                
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier_level, 1)