from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from content.models import EditableContent, NewsCard
from unittest.mock import patch, MagicMock
import json

class EditableContentViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        EditableContent.objects.create(component="Hero", section="title", text_value="Test Title")
        EditableContent.objects.create(component="Footer", section="copyright", text_value="Copyright 2025")

    def test_list_editable_content(self):
        response = self.client.get("/editable-content/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
    
    def test_filter_by_component(self):
        response = self.client.get("/editable-content/?component=Hero")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['component'], "Hero")


class EditableContentUpdateViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        EditableContent.objects.create(component="Hero", section="title", text_value="Test Title")
    
    def test_update_content(self):
        data = {
            "component": "Hero",
            "section": "title",
            "text_value": "Updated Title"
        }
        response = self.client.put("/editable-content/update/", data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['text_value'], "Updated Title")
        
        updated_content = EditableContent.objects.get(component="Hero", section="title")
        self.assertEqual(updated_content.text_value, "Updated Title")


class NewsCardViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.card1 = NewsCard.objects.create(
            title="Card 1",
            order=0,
            category="News",
            date="March 27, 2025",
            paragraphs="This is the first news card content.",
            link="https://example.com/news1"
        )
        self.card2 = NewsCard.objects.create(
            title="Card 2",
            order=1,
            category="Events",
            date="March 28, 2025",
            paragraphs="This is the second news card content.",
            link="https://example.com/news2"
        )
    
    def test_list_news_cards(self):
        response = self.client.get("/news-cards/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
    
    def test_create_single_news_card(self):
        data = {
            "title": "New Card",
            "order": 2,
            "category": "Tech",
            "date": "March 29, 2025",
            "paragraphs": "This is a new card for tech news.",
            "link": "https://example.com/tech1"
        }
        response = self.client.post("/news-cards/", data, format='json')
        self.assertEqual(response.status_code, 201)
        
        self.assertEqual(NewsCard.objects.count(), 3)
        
        cards = NewsCard.objects.all().order_by('order')
        for i, card in enumerate(cards):
            self.assertEqual(card.order, i)
    
    def test_create_multiple_news_cards(self):
        data = [
            {
                "title": "Batch Card 1",
                "order": 2,
                "category": "Science",
                "date": "March 30, 2025",
                "paragraphs": "This is the first batch card content.",
                "link": "https://example.com/science1"
            },
            {
                "title": "Batch Card 2",
                "order": 3,
                "category": "Health",
                "date": "March 31, 2025",
                "paragraphs": "This is the second batch card content.",
                "link": "https://example.com/health1"
            }
        ]
        response = self.client.post("/news-cards/", data, format='json')
        self.assertEqual(response.status_code, 201)
        
        self.assertEqual(NewsCard.objects.count(), 4)
        
        cards = NewsCard.objects.all().order_by('order')
        for i, card in enumerate(cards):
            self.assertEqual(card.order, i)
    
    def test_update_news_card(self):
        data = {
            "title": "Updated Card",
            "order": 0,
            "category": "Updated Category",
            "date": "April 1, 2025",
            "paragraphs": "This content has been updated.",
            "link": "https://example.com/updated"
        }
        response = self.client.put(f"/news-cards/{self.card1.id}/", data, format='json')
        self.assertEqual(response.status_code, 200)
        
        updated_card = NewsCard.objects.get(id=self.card1.id)
        self.assertEqual(updated_card.title, "Updated Card")
        
        cards = NewsCard.objects.all().order_by('order')
        for i, card in enumerate(cards):
            self.assertEqual(card.order, i)
    
    def test_update_order(self):
        data = [
            {
                "id": self.card1.id,
                "order": 1
            },
            {
                "id": self.card2.id,
                "order": 0
            }
        ]
        response = self.client.patch("/news-cards/update-order/", data, format='json')
        self.assertEqual(response.status_code, 200)
        
        card1 = NewsCard.objects.get(id=self.card1.id)
        card2 = NewsCard.objects.get(id=self.card2.id)
        
        self.assertEqual(card1.order, 1)
        self.assertEqual(card2.order, 0)
    
    def test_update_order_missing_id(self):
        data = [
            {
                "order": 1
            },
            {
                "id": self.card2.id,
                "order": 0
            }
        ]
        response = self.client.patch("/news-cards/update-order/", data, format='json')
        self.assertEqual(response.status_code, 200)
        
        card2 = NewsCard.objects.get(id=self.card2.id)
        self.assertEqual(card2.order, 0)


class SendEmailViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    @patch('content.views.smtplib.SMTP')
    @override_settings(
        EMAIL_HOST='smtp.example.com',
        EMAIL_PORT=587,
        EMAIL_HOST_USER='testuser@example.com',
        EMAIL_HOST_PASSWORD='testpassword'
    )
    def test_send_email_success(self, mock_smtp):
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server
        
        data = {
            "to": "recipient@example.com",
            "subject": "Test Email",
            "message": "This is a test email",
            "email": "sender@example.com"
        }
        
        response = self.client.post("/send-email/", data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)
        
        mock_server.ehlo.assert_called()
        mock_server.starttls.assert_called()
        mock_server.login.assert_called_with(
            "testuser@example.com", "testpassword"
        )
        mock_server.send_message.assert_called()
        mock_server.quit.assert_called()
    
    @patch('content.views.smtplib.SMTP')
    @override_settings(
        EMAIL_HOST='smtp.example.com',
        EMAIL_PORT=587,
        EMAIL_HOST_USER='testuser@example.com',
        EMAIL_HOST_PASSWORD='testpassword'
    )
    def test_send_email_default_recipient(self, mock_smtp):
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server
        
        data = {
            "subject": "Test Email",
            "message": "This is a test email"
        }
        
        response = self.client.post("/send-email/", data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["success"], True)
        
        args, _ = mock_server.send_message.call_args
        self.assertEqual(args[0]['To'], "teampuzzled25@gmail.com")
    
    @patch('content.views.smtplib.SMTP')
    @override_settings(
        EMAIL_HOST='smtp.example.com',
        EMAIL_PORT=587,
        EMAIL_HOST_USER='testuser@example.com',
        EMAIL_HOST_PASSWORD='testpassword'
    )
    def test_send_email_exception(self, mock_smtp):
        mock_smtp.side_effect = Exception("Connection refused")
        
        data = {
            "subject": "Test Email",
            "message": "This is a test email"
        }
        
        response = self.client.post("/send-email/", data, format='json')
        
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data["success"], False)
        self.assertEqual(response.data["message"], "Connection refused")