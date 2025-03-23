from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from users.models import User  # Adjust import path if necessary
import json

# ✅ Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY


# ✅ CreateCheckoutSessionView
class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        print(f"User requesting subscription: {user.email}, tier_level: {user.tier_level}")

        # ✅ Block if user is already subscribed
        if user.tier_level == 1:
            print("Blocked: User is already subscribed.")
            return Response({'error': 'You are already subscribed!'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Get payment option and number of users from frontend
        payment_option = request.data.get('paymentOption')
        num_of_users = request.data.get('numOfUsers')

        print(f"Received paymentOption: {payment_option}, numOfUsers: {num_of_users}")

        # ✅ Map paymentOption to Stripe Price IDs (replace with your actual Stripe price IDs)
        price_map = {
            "$895 Per Month": "price_1R5ki9FdjBkEBqgJRleG2vGT",      # test price id
            "$1495 Per Quarter": "price_1R5ki9FdjBkEBqgJRleG2vGT",   # test price id
            "$3995 Per Annum": "price_1R5ki9FdjBkEBqgJRleG2vGT"      # test price id
        }

        stripe_price_id = price_map.get(payment_option)
        print(f"Stripe Price ID resolved: {stripe_price_id}")

        if not stripe_price_id:
            print("Error: Invalid payment option received.")
            return Response({'error': 'Invalid payment option selected!'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # ✅ Create Stripe Checkout Session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                line_items=[
                    {
                        'price': stripe_price_id,
                        'quantity': 1,
                    },
                ],
                customer_email=user.email,
                success_url='http://localhost:3000/success',  # Replace with your frontend success URL
                cancel_url='http://localhost:3000/cancel',    # Replace with your frontend cancel URL
            )

            print(f"Checkout session created: {checkout_session.id}")

            return Response({'sessionId': checkout_session.id})

        except Exception as e:
            print(f"Stripe error occurred: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ CreateCustomerPortalSessionView (Manage/Cancel Subscription)
class CreateCustomerPortalSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        print(f"Requesting Customer Portal session for: {user.email}")

        try:
            # Search for the Stripe customer by email
            customers = stripe.Customer.list(email=user.email)

            if not customers.data:
                print("No Stripe customer found for user.")
                return Response({'error': 'Stripe customer not found.'}, status=status.HTTP_404_NOT_FOUND)

            stripe_customer_id = customers.data[0].id
            print(f"Stripe customer found: {stripe_customer_id}")

            # Create Customer Portal session
            session = stripe.billing_portal.Session.create(
                customer=stripe_customer_id,
                return_url='http://localhost:3000/account'  # Replace with your frontend account/dashboard page
            )

            print(f"Customer Portal session created: {session.url}")
            return Response({'url': session.url})

        except Exception as e:
            print(f"Error creating Customer Portal session: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Stripe Webhook Endpoint
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    print("Webhook received.")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        print(f"Webhook verified: {event['type']}")
    except ValueError as e:
        print(f"Invalid payload: {e}")
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"Invalid signature: {e}")
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    # ✅ Handle checkout.session.completed event (Upgrade user)
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_email = session.get('customer_email')

        print(f"Checkout session completed for: {customer_email}")

        try:
            user = User.objects.get(email=customer_email)
            user.tier_level = 1
            user.save()

            print(f"User {user.email} upgraded to tier 1.")
        except User.DoesNotExist:
            print(f"User not found for email: {customer_email}")
