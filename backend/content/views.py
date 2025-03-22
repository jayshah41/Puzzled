from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .models import EditableContent, NewsCard
from .serializers import EditableContentSerializer, NewsCardSerializer
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import ssl
import smtplib

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
    
class NewsCardViewSet(viewsets.ModelViewSet):
    queryset = NewsCard.objects.all()
    serializer_class = NewsCardSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def _update_order_internal(self, cards):
        for index, card in enumerate(cards):
            card.order = index
            card.save()
    
    def create(self, request, *args, **kwargs):
        data = request.data
        
        if isinstance(data, list):
            serializer = self.get_serializer(data=data, many=True)
        else:
            serializer = self.get_serializer(data=data)
            
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        self._update_order_internal(NewsCard.objects.all())
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        self._update_order_internal(NewsCard.objects.all())
        
        return response
    
    @action(detail=False, methods=['patch'])
    def update_order(self, request):
        cards_data = request.data
        for card_data in cards_data:
            if 'id' not in card_data:
                continue
                
            card = NewsCard.objects.get(id=card_data['id'])
            card.order = card_data['order']
            card.save()
        return Response({'status': 'orders updated'})
    
logger = logging.getLogger(__name__)

class SendEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            logger.debug(f"Received email request data: {data}")
            
            to_email = data.get('to', 'teampuzzled25@gmail.com')
            subject = data.get('subject', 'New Contact Form Submission')
            message_body = data.get('message', '')
            
            sender_email = None
            if 'email' in data:
                sender_email = data['email']
                logger.debug(f"Sender email: {sender_email}")
            
            msg = MIMEMultipart()
            msg['From'] = settings.EMAIL_HOST_USER
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if sender_email:
                msg['Reply-To'] = sender_email
            
            msg.attach(MIMEText(message_body, 'plain'))
            
            context = ssl._create_unverified_context()
            
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            
            server.send_message(msg)
            server.quit()
            
            logger.debug("Email sent successfully")
            return Response({"success": True, "message": "Email sent successfully"}, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}", exc_info=True)
            return Response({"success": False, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)