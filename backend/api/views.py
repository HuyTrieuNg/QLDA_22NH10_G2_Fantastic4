from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TestModel
from .serializers import TestModelSerializer
from django.db import connection

class HelloView(APIView):
    def get(self, request):
        return Response({"message": "Hello from Django!"})

class TestConnectionView(APIView):
    def get(self, request):
        # Kiểm tra kết nối database
        db_status = "Connected"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = "Connected" if cursor.fetchone() else "Disconnected"
        except Exception as e:
            db_status = f"Error: {str(e)}"
        
        return Response({
            "message": "API test connection",
            "service": "Django REST API",
            "database_status": db_status
        })

class TestDatabaseView(APIView):
    def get(self, request):
        items = TestModel.objects.all()
        serializer = TestModelSerializer(items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TestModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)