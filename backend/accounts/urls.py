from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView
from .views import LoginView, MeView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
    path("logout/", TokenBlacklistView.as_view()),
    path("me/", MeView.as_view()),
]
