from django.contrib import admin
from .models import Activity, Front, Project, Supply, Worker


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "active"]
    filter_horizontal = ["members"]


admin.site.register([Activity, Front, Worker, Supply])
