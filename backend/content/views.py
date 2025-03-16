from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import EditableContent
from .serializers import EditableContentSerializer

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