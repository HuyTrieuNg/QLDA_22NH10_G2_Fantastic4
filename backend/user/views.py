from django.shortcuts import render
from rest_framework import generics, status
from .serializers import (
    UserRegisterSerializer, LoginSerializer, UserSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
import os

# Create your views here.

class RegisterView(generics.CreateAPIView):
    """
    Register a new user
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

class LoginView(APIView):
    """
    Authenticate a user and return tokens
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user_type = user.profile.user_type if hasattr(user, 'profile') else None
        return Response({
            'refresh': serializer.validated_data['refresh'],
            'access': serializer.validated_data['access'],
            'user_type': user_type
        })

class LogoutView(APIView):
    """
    Logout a user by blacklisting their refresh token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Đăng xuất thành công"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Đã xảy ra lỗi khi đăng xuất"}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    """
    View and update user profile information
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        
        # Add additional profile data
        profile = user.profile
        data = serializer.data
        data.update({
            'phone_number': profile.phone_number,
            'bio': profile.bio,
            'date_of_birth': profile.date_of_birth,
            'avatar': request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
        })
        return Response(data)
    
    def put(self, request):
        user = request.user
        user_data = {
            'first_name': request.data.get('first_name', user.first_name),
            'last_name': request.data.get('last_name', user.last_name),
            'email': request.data.get('email', user.email)
        }
        
        serializer = UserSerializer(user, data=user_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Update profile fields
            profile = user.profile
            profile.phone_number = request.data.get('phone_number', profile.phone_number)
            profile.bio = request.data.get('bio', profile.bio)
            
            if 'date_of_birth' in request.data:
                profile.date_of_birth = request.data['date_of_birth']
                
            # Update user_type if included (and user has permission)
            if 'user_type' in request.data and (request.user.is_staff or request.user.profile.user_type == 'admin'):
                profile.user_type = request.data['user_type']
                
            profile.save()
            
            # Return the updated data
            return self.get(request)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvatarUploadView(APIView):
    """
    Upload user avatar
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response({'error': 'Không có file ảnh được tải lên'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        
        # Delete old avatar if exists
        if profile.avatar:
            profile.avatar.delete()
            
        profile.avatar = request.FILES['avatar']
        profile.save()
        
        return Response({
            'message': 'Cập nhật ảnh đại diện thành công',
            'avatar_url': request.build_absolute_uri(profile.avatar.url)
        })

class ChangePasswordView(APIView):
    """
    Change user password
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Check if current password is correct
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({"current_password": ["Mật khẩu hiện tại không đúng"]}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Đổi mật khẩu thành công"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """
    Request password reset email
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                token_generator = PasswordResetTokenGenerator()
                token = token_generator.make_token(user)
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Build reset URL
                current_site = get_current_site(request)
                relative_url = reverse('password-reset-confirm')
                reset_url = f"{request.scheme}://{current_site.domain}{relative_url}?uidb64={uidb64}&token={token}"
                
                # Send email
                mail_subject = "Đặt lại mật khẩu cho tài khoản của bạn"
                message = f"Xin chào {user.first_name},\n\nĐể đặt lại mật khẩu cho tài khoản của bạn, vui lòng nhấn vào liên kết sau:\n\n{reset_url}\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nXin cảm ơn!"
                
                send_mail(
                    subject=mail_subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return Response({"detail": "Email đặt lại mật khẩu đã được gửi."}, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Return success even if email not found for security reasons
                return Response({"detail": "Email đặt lại mật khẩu đã được gửi."}, status=status.HTTP_200_OK)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uidb64 = serializer.validated_data['uidb64']
                token = serializer.validated_data['token']
                user_id = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=user_id)
                
                # Verify token
                token_generator = PasswordResetTokenGenerator()
                if not token_generator.check_token(user, token):
                    return Response({"detail": "Token không hợp lệ hoặc đã hết hạn"}, 
                                 status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                
                return Response({"detail": "Đặt lại mật khẩu thành công"}, status=status.HTTP_200_OK)
                
            except (User.DoesNotExist, ValueError, TypeError, OverflowError):
                return Response({"detail": "Token không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    """
    List all users (for admin and teacher access)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin or teacher
        if not request.user.is_staff and request.user.profile.user_type != 'teacher':
            return Response({"detail": "Không có quyền truy cập"}, status=status.HTTP_403_FORBIDDEN)
            
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
