import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
import stripe
import json

User = get_user_model()


@pytest.mark.django_db
class TestStripeEndpoints:
    def setup_method(self, method):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="pass"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch("payments.views.stripe.checkout.Session.create")
    def test_checkout_session_success(self, mock_create_session):
        self.user.tier_level = 0
        self.user.save()
        mock_session = MagicMock()
        mock_session.id = "session123"
        mock_create_session.return_value = mock_session

        response = self.client.post("/payments/create-checkout-session/", {
            "paymentOption": "$895 Per Month",
            "numOfUsers": 1
        })
        assert response.status_code == 200
        assert "sessionId" in response.json()

    def test_checkout_session_invalid_option(self):
        self.user.tier_level = 0
        self.user.save()
        response = self.client.post("/payments/create-checkout-session/", {
            "paymentOption": "invalid",
            "numOfUsers": 1
        })
        assert response.status_code == 400

    def test_checkout_session_missing_fields(self):
        self.user.tier_level = 0
        self.user.save()
        response = self.client.post("/payments/create-checkout-session/", {})
        assert response.status_code == 400

    def test_checkout_session_already_subscribed(self):
        self.user.tier_level = 1
        self.user.save()
        response = self.client.post("/payments/create-checkout-session/", {
            "paymentOption": "$895 Per Month",
            "numOfUsers": 1
        })
        assert response.status_code == 400

    @patch("payments.views.stripe.checkout.Session.create", side_effect=Exception("Stripe error"))
    def test_checkout_session_stripe_exception(self, _):
        self.user.tier_level = 0
        self.user.save()
        response = self.client.post("/payments/create-checkout-session/", {
            "paymentOption": "$895 Per Month",
            "numOfUsers": 1
        })
        assert response.status_code == 500

    def test_verify_subscription_no_tier(self):
        self.user.tier_level = 0
        self.user.save()
        response = self.client.get("/payments/verify-subscription/")
        assert response.status_code == 400

    def test_verify_subscription_success(self):
        self.user.tier_level = 1
        self.user.save()
        response = self.client.get("/payments/verify-subscription/")
        assert response.status_code == 200
        assert response.json()["tier_level"] == 1


@pytest.mark.django_db
class TestStripeWebhook:
    def setup_method(self, method):
        self.client = APIClient()
        self.user = User.objects.create_user(username="webhookuser", email="webhook@example.com", password="pass")

    @patch("payments.views.stripe.Webhook.construct_event", side_effect=stripe.error.SignatureVerificationError("bad sig", "payload"))
    def test_webhook_invalid_signature(self, _):
        response = self.client.post("/payments/stripe-webhook/", data="{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="bad")
        assert response.status_code == 400

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_checkout_completed_user_exists(self, mock_event):
        mock_event.return_value = {
            "type": "checkout.session.completed",
            "data": {"object": {"customer_email": "webhook@example.com"}}
        }
        response = self.client.post("/payments/stripe-webhook/", data="{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="sig")
        assert response.status_code == 200

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_checkout_completed_missing_email(self, mock_event):
        mock_event.return_value = {
            "type": "checkout.session.completed",
            "data": {"object": {}}
        }
        response = self.client.post("/payments/stripe-webhook/", data="{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="sig")
        assert response.status_code == 400

    @patch("payments.views.stripe.Customer.retrieve")
    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_subscription_deleted_success(self, mock_event, mock_customer):
        mock_event.return_value = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cust_123"}}
        }
        mock_customer.return_value = {"email": "webhook@example.com"}

        response = self.client.post("/payments/stripe-webhook/", data="{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="sig")
        assert response.status_code == 200

    @patch("payments.views.stripe.Customer.retrieve", side_effect=Exception("Some error"))
    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_subscription_deleted_customer_retrieve_fail(self, mock_event, _):
        mock_event.return_value = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cust_123"}}
        }
        response = self.client.post("/payments/stripe-webhook/", data="{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="sig")
        assert response.status_code == 200

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_unhandled_event(self, mock_event):
        mock_event.return_value = {
            "type": "random.event",
            "data": {"object": {}}
        }
        response = self.client.post("/payments/stripe-webhook/", data="{}", content_type="application/json", HTTP_STRIPE_SIGNATURE="sig")
        assert response.status_code == 200

    @patch("payments.views.User.objects.get", side_effect=User.DoesNotExist)
    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_checkout_completed_user_not_found(self, mock_event, _):
        mock_event.return_value = {
            "type": "checkout.session.completed",
            "data": {"object": {"customer_email": "notfound@example.com"}}
        }
        response = self.client.post(
            "/payments/stripe-webhook/",
            data="{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig"
        )
        assert response.status_code == 200

    @patch("payments.views.stripe.Customer.retrieve")
    @patch("payments.views.User.objects.get", side_effect=User.DoesNotExist)
    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_subscription_deleted_user_not_found(self, mock_event, _, mock_retrieve):
        mock_event.return_value = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cust_999"}}
        }
        mock_retrieve.return_value = {"email": "missing@example.com"}
        response = self.client.post(
            "/payments/stripe-webhook/",
            data="{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig"
        )
        assert response.status_code == 200

    @patch("payments.views.stripe.Customer.retrieve", return_value={})
    @patch("payments.views.stripe.Webhook.construct_event")
    def test_webhook_subscription_deleted_missing_customer_email(self, mock_event, _):
        mock_event.return_value = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cust_000"}}
        }
        response = self.client.post(
            "/payments/stripe-webhook/",
            data="{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig"
        )
        assert response.status_code == 400


