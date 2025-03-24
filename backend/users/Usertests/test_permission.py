from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .test_base import BaseUserTestCase


User = get_user_model()

class PermissionTests(BaseUserTestCase):

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without authentication."""
        
        profile_url = reverse('profile')
        profile_response = self.client.get(profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        update_url = reverse('update-profile')
        update_response = self.client.patch(update_url, {'first_name': 'Unauthorized'}, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        delete_url = reverse('delete-account')
        delete_response = self.client.post(delete_url, {'password': 'password123'}, format='json')
        self.assertEqual(delete_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        tier_url = reverse('update-tier')
        tier_response = self.client.patch(tier_url, {'tier_level': 2}, format='json')
        self.assertEqual(tier_response.status_code, status.HTTP_401_UNAUTHORIZED)