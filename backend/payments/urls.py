from django.urls import path
from .views import CreateCheckoutSessionView, stripe_webhook, CreateCustomerPortalSessionView

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('stripe-webhook/', stripe_webhook, name='stripe-webhook'),
    path('create-customer-portal-session/', CreateCustomerPortalSessionView.as_view(), name='create-customer-portal-session')
]
