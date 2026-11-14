from decimal import Decimal
from rest_framework import serializers
from .models import Cut, CutRevision
from .permissions import can_edit_cut


class ActivityInputSerializer(serializers.Serializer):
    activity = serializers.IntegerField(min_value=1)
    quantity = serializers.DecimalField(max_digits=14, decimal_places=3, min_value=Decimal("0.001"))


class LaborInputSerializer(serializers.Serializer):
    worker = serializers.IntegerField(min_value=1)
    hours = serializers.DecimalField(max_digits=9, decimal_places=2, min_value=Decimal("0.01"))


class SupplyInputSerializer(serializers.Serializer):
    supply = serializers.IntegerField(min_value=1)
    quantity = serializers.DecimalField(max_digits=14, decimal_places=3, min_value=Decimal("0.001"))


class CutInputSerializer(serializers.Serializer):
    request_id = serializers.UUIDField()
    project = serializers.IntegerField(min_value=1)
    front = serializers.IntegerField(min_value=1)
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True, max_length=5000, default="")
    activities = ActivityInputSerializer(many=True, allow_empty=False)
    labor = LaborInputSerializer(many=True, allow_empty=False)
    supplies = SupplyInputSerializer(many=True, required=False, default=list)
    version = serializers.IntegerField(min_value=1, required=False)
    reason = serializers.CharField(min_length=10, max_length=1000, required=False)

    def validate(self, attrs):
        if attrs["period_end"] < attrs["period_start"]:
            raise serializers.ValidationError({"period_end": "El fin debe ser igual o posterior al inicio."})
        days = (attrs["period_end"] - attrs["period_start"]).days + 1
        for entry in attrs["labor"]:
            if entry["hours"] > days * 24:
                raise serializers.ValidationError({"labor": "Las horas por trabajador superan las horas del periodo."})
        if self.context.get("editing") and ("version" not in attrs or "reason" not in attrs):
            raise serializers.ValidationError("Indica la versión actual y un motivo de al menos 10 caracteres.")
        return attrs


class CutSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name")
    project_code = serializers.CharField(source="project.code")
    front_name = serializers.CharField(source="front.name")
    author_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display")
    can_edit = serializers.SerializerMethodField()
    data = serializers.SerializerMethodField()

    class Meta:
        model = Cut
        fields = [
            "id", "request_id", "project", "project_name", "project_code", "front", "front_name", "author_name",
            "period_start", "period_end", "notes", "status", "status_label", "version",
            "created_at", "updated_at", "can_edit", "data",
        ]

    def get_author_name(self, cut):
        return str(cut.author)

    def get_can_edit(self, cut):
        return can_edit_cut(self.context["request"].user, cut)

    def get_data(self, cut):
        if hasattr(cut, "current_revisions"):
            revision = next(iter(cut.current_revisions), None)
        else:
            revision = cut.revisions.first()
        return revision.snapshot if revision else {}


class RevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CutRevision
        fields = ["version", "editor_name", "editor_role", "reason", "created_at", "snapshot"]
