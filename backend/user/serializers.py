from django.contrib.auth.models import User
from rest_framework import serializers
from .models.user_profile import UserProfile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('user_type',)

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPE_CHOICES, write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'user_type')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        try:
            validate_password(attrs['password'])
        except Exception as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'student')
        validated_data.pop('password2', None)
        try:
            user = User(**validated_data)
            user._user_type = user_type  # Gán tạm user_type để signal lấy
            user.set_password(validated_data['password'])
            user.save()
            print("✅ User created:", user.username)
        except Exception as e:
            print("❌ Error creating user:", e)
            raise serializers.ValidationError({"detail": "Lỗi khi tạo user."})
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # In Django, authenticate() cần rõ ràng request
        username = data.get('username', '')
        password = data.get('password', '')
        
        user = authenticate(username=username, password=password)
        
        if user and user.is_active:
            # Đảm bảo người dùng có hồ sơ
            try:
                # Kiểm tra xem người dùng đã có hồ sơ chưa
                profile = user.profile
            except (AttributeError, UserProfile.DoesNotExist):
                # Nếu không, tạo một hồ sơ mới với vai trò mặc định là 'student'
                UserProfile.objects.create(user=user, user_type='student')
                
            tokens = RefreshToken.for_user(user)
            return {
                'user': user,
                'refresh': str(tokens),
                'access': str(tokens.access_token),
            }
        raise ValidationError("Thông tin đăng nhập không chính xác")

class UserSerializer(serializers.ModelSerializer):
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'user_type')

    def get_user_type(self, obj):
        try:
            return obj.profile.user_type
        except (AttributeError, UserProfile.DoesNotExist):
            return None

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "Mật khẩu mới không khớp."})
        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    uidb64 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "Mật khẩu mới không khớp."})
        return attrs
