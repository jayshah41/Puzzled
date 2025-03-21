from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import EditableContent, NewsCard
from .serializers import EditableContentSerializer, NewsCardSerializer

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