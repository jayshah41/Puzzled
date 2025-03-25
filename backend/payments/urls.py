from django.urls import path
from .views import CreateCheckoutSessionView, stripe_webhook, verify_subscription

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('stripe-webhook/', stripe_webhook, name='stripe-webhook'),
    path('verify-subscription/', verify_subscription, name='verify-subscription')
]