from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer

class RegisterView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(
                    {"message": "User created successfully"}, 
                    status=status.HTTP_201_CREATED, 
                    headers=headers
                )
            except Exception as e:
                return Response(
                    {"error": str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Create your views here.
