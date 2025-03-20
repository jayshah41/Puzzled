from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from django.contrib.auth.hashers import check_password

User = get_user_model()

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data  # Get the data from the request.
        
        # Manually handle user creation (you could rely on the serializer, but let's handle it step-by-step)
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        phone_number = data.get('phone_number', '')
        
        # Check if necessary fields are provided
        if not email or not username or not password:
            return Response({"error": "Email, username, and password are required fields."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the email already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email is already taken."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the username already exists
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username is already taken."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the user using the validated data
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
        )
        
        # Now return the response with the user's data
        serializer = UserSerializer(user)  # Serialize the user
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# User Login View (JWT)
class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            })
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  
    
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
        
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data
        
        # Handle password change
        if 'old_password' in data and 'new_password' in data:
            if not check_password(data['old_password'], user.password):
                return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
            
        # Handle other profile updates
        serializer = self.get_serializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteAccountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get('password')

        if not check_password(password, user.password):
            return Response({"error": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)

        user.delete()
        return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)
    
class UpdateTierView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        tier_level = request.data.get('tier_level')

        if tier_level not in [0, 1, 2]: 
            return Response({"error": "Invalid tier level"}, status=status.HTTP_400_BAD_REQUEST)

        user.tier_level = tier_level
        user.save()
        return Response({"message": "Tier level updated successfully"}, status=status.HTTP_200_OK)
