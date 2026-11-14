from django.contrib import admin
from .models import Cut, CutRevision


@admin.register(Cut)
class CutAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "author", "period_start", "period_end", "status", "version"]
    list_filter = ["status", "project"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(CutRevision)
class RevisionAdmin(admin.ModelAdmin):
    list_display = ["cut", "version", "editor_name", "created_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
