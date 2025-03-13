from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .models import EditableContent
from .serializers import EditableContentSerializer

User = get_user_model()

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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

# Get User Profile (Only Authenticated Users)
class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  # Returns the logged-in user's data


class EditableContentView(generics.ListAPIView):
    serializer_class = EditableContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        component = self.request.query_params.get('component', None)
        if component:
            return EditableContent.objects.filter(component=component)
        return EditableContent.objects.all()


class EditableContentUpdateView(generics.UpdateAPIView):
    queryset = EditableContent.objects.all()
    serializer_class = EditableContentSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        component = self.request.data.get('component')
        section = self.request.data.get('section')
        return EditableContent.objects.get(component=component, section=section)