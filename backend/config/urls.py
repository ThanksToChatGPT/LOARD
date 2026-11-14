from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from cuts.views import CutViewSet
from projects.views import ProjectViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("cuts", CutViewSet, basename="cut")
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include(router.urls)),
]
admin.site.site_header = "Loard · Administración"
admin.site.site_title = "Loard"
