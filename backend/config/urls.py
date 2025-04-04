"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView, LoginView, ProfileView, UpdateProfileView, DeleteAccountView, UpdateTierView
from rest_framework_simplejwt.views import TokenRefreshView
from content.views import EditableContentView, EditableContentUpdateView, NewsCardViewSet, SendEmailView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('update-tier/', UpdateTierView.as_view(), name='update-tier'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), ##########################
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('data/', include('api.urls')),
    path('editable-content/', EditableContentView.as_view(), name='editable-content'),
    path('editable-content/update/', EditableContentUpdateView.as_view(), name='editable-content-update'),
    path('news-cards/update-order/', NewsCardViewSet.as_view({'patch': 'update_order'}), name='newscard-update-order'),
    path('news-cards/<int:pk>/', NewsCardViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='newscard-detail'),
    path('news-cards/', NewsCardViewSet.as_view({'get': 'list', 'post': 'create'}), name='newscard-list'),
    path('news-cards/update-order/', NewsCardViewSet.as_view({'patch': 'update_order'}), name='newscard-direct-update-order'),
    path('news-cards/<int:pk>/', NewsCardViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='newscard-direct-detail'),
    path('news-cards/', NewsCardViewSet.as_view({'get': 'list', 'post': 'create'}), name='newscard-direct-list'),
    path('send-email/', SendEmailView.as_view(), name='send-email'),
    path('payments/', include('payments.urls')),
]
