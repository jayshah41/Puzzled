from django.test import TestCase, Client
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from unittest.mock import patch
from django.urls import reverse
from api.models import Company, MarketTrends

User = get_user_model()


class MarketStatisticsViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        company = Company.objects.create(asx_code="ABC", company_name="Test Co")
        MarketTrends.objects.create(asx_code=company, week_price_change=1.2, month_price_change=5.0)

    def test_market_statistics_response(self):
        response = self.client.get("/data/market-statistics/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("ASX_code_count", response.data)


class CompanyDetailsViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        Company.objects.create(asx_code='XYZ', company_name='XYZ Mining')

    def test_company_details_view(self):
        response = self.client.get("/data/company-details/")  
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)


class GetTweetsViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    @patch("api.views.requests.get")
    def test_get_tweets_success(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.text = "<rss>Some RSS feed</rss>"
        response = self.client.get("/data/tweets/nasa/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("rss", response.json())

    @patch("api.views.requests.get")
    def test_get_tweets_failure(self, mock_get):
        mock_get.return_value.status_code = 500
        response = self.client.get("/data/tweets/nasa/")
        self.assertEqual(response.status_code, 500)

    @patch("api.views.requests.get")
    def test_get_tweets_exception(self, mock_get):
        mock_get.side_effect = Exception("Simulated crash")
        response = self.client.get("/data/tweets/nasa/")
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.json())
        self.assertEqual(response.json()["error"], "Simulated crash")

