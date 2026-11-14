from rest_framework import serializers
from .models import Activity, Front, Project, Supply, Worker


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "code", "name"]


class FrontSerializer(serializers.ModelSerializer):
    class Meta:
        model = Front
        fields = ["id", "name"]


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["id", "code", "name", "unit", "planned_quantity"]


class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ["id", "name", "identification"]


class SupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Supply
        fields = ["id", "name", "unit"]
