from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs["email"] = attrs["email"].strip().lower()
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role_label = serializers.CharField(source="get_role_display")

    class Meta:
        model = User
        fields = ["id", "email", "name", "role", "role_label", "is_superuser"]

    def get_name(self, user):
        return user.get_full_name() or user.email
