from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from users.models import User
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

stripe.api_key = settings.STRIPE_SECRET_KEY



class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        print(f"User requesting subscription: {user.email}, tier_level: {user.tier_level}")

        if user.tier_level == 1:
            print("Blocked: User is already subscribed.")
            return Response({'error': 'You are already subscribed!'}, status=status.HTTP_400_BAD_REQUEST)

        payment_option = request.data.get('paymentOption')
        num_of_users = request.data.get('numOfUsers')

        print(f"Received paymentOption: {payment_option}, numOfUsers: {num_of_users}")

        price_map = {
            "$895 Per Month": "price_1R5qtiFdjBkEBqgJyHS1Nabe",      
            "$1495 Per Quarter": "price_1R5qufFdjBkEBqgJUg0a7Tc0",   
            "$3995 Per Annum": "price_1R5qvtFdjBkEBqgJMjXVZ6Nv"      
        }

        stripe_price_id = price_map.get(payment_option)
        print(f"Stripe Price ID resolved: {stripe_price_id}")

        if not stripe_price_id:
            print("Error: Invalid payment option received.")
            return Response({'error': 'Invalid payment option selected!'}, status=status.HTTP_400_BAD_REQUEST)

        try:
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
                client_reference_id=user.id,
                success_url='http://localhost:3000/stripe-success',  
                cancel_url='http://localhost:3000/',    
            )

            print(f"Checkout session created: {checkout_session.id}")

            return Response({'sessionId': checkout_session.id})

        except Exception as e:
            print(f"Stripe error occurred: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def stripe_webhook(request):
    import json
    from django.http import JsonResponse
    from django.conf import settings

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    print("Webhook received...")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=endpoint_secret
        )
        print(f"Webhook verified. Event: {event['type']}")
    except ValueError as e:
        print(f"Invalid payload: {e}")
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"Invalid signature: {e}")
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_email = session.get('customer_email')

        print(f"Checkout session completed for {customer_email}")

        if not customer_email:
            print("No customer email found in session.")
            return JsonResponse({'error': 'No customer email found'}, status=400)

        try:
            user = User.objects.get(email=customer_email)
            user.tier_level = 1
            user.save()
            print(f"User {user.email} upgraded to tier 1.")
        except User.DoesNotExist:
            print(f"User with email {customer_email} does not exist.")

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')

        print(f"Subscription deleted for customer_id {customer_id}")

        try:
            customer = stripe.Customer.retrieve(customer_id)
            customer_email = customer.get('email')

            if not customer_email:
                print("No customer email found in Stripe customer.")
                return JsonResponse({'error': 'No customer email found'}, status=400)

            user = User.objects.get(email=customer_email)
            user.tier_level = 0
            user.save()
            print(f"User {user.email} downgraded to tier 0.")
        except User.DoesNotExist:
            print(f"User with email {customer_email} does not exist.")
        except Exception as e:
            print(f"Error retrieving customer or updating user: {e}")

    return JsonResponse({'status': 'success'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_subscription(request):
    """
    Verify the user's subscription status.
    """
    user = request.user  # Get the authenticated user
    if user.tier_level >= 1:  # Check if the user has an active subscription
        return Response({'message': 'Subscription verified', 'tier_level': user.tier_level})
    return Response({'error': 'No active subscription found'}, status=status.HTTP_400_BAD_REQUEST)