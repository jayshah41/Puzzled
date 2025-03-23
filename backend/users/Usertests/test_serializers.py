from rest_framework import serializers
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from .test_base import BaseUserTestCase


User = get_user_model()

class SerializerTests(BaseUserTestCase):

    def test_serializer_valid_data(self):
        """Test serializer with valid user data."""
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
        """Test serializer with invalid data."""
        invalid_data = self.user_data.copy()
        del invalid_data['email']

        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_user_creation(self):
        """Test user creation through model method."""
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

    def test_serializer_create_without_password(self):
        """Test serializer create method without providing password."""
        data = {
            'email': 'nopassword@example.com',
            'username': 'nopassworduser',
            'first_name': 'No',
            'last_name': 'Password'
        }
        serializer = UserSerializer(data=data)
    
        with self.assertRaises(serializers.ValidationError):
            serializer.is_valid(raise_exception=True)
            serializer.save()

    def test_serializer_create_with_password(self):
        """Test user creation with valid data through serializer."""
        data = {
            'email': 'newcreate@example.com',
            'username': 'newcreateuser',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'Create'
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertEqual(user.email, data['email'])
        self.assertTrue(user.check_password(data['password']))

    def test_serializer_update_with_password(self):
        """Test updating user with password through serializer."""
        user = User.objects.create_user(
            email="updatetest@example.com", 
            username="updatetestuser",
            password="oldpassword123"
        )
        
        data = {
            'first_name': 'Updated',
            'last_name': 'User',
            'password': 'newupdatedpassword'
        }
        
        serializer = UserSerializer(user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        
        self.assertEqual(updated_user.first_name, data['first_name'])
        self.assertEqual(updated_user.last_name, data['last_name'])
        self.assertTrue(updated_user.check_password(data['password']))