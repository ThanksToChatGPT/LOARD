import hashlib
import json
from decimal import Decimal

from django.db import transaction
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Sum
from django.utils import timezone
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

from projects.access import accessible_projects
from projects.models import Activity, Front, Project, Supply, Worker
from .models import ActivityEntry, Cut, CutRevision, LaborEntry, SupplyEntry
from .permissions import can_edit_cut


class VersionConflict(APIException):
    status_code = 409
    default_detail = "El corte cambió mientras lo editabas. Revisa la versión actual antes de guardar."


def resolve_entries(model, project, rows, key):
    identifiers = [row[key] for row in rows]
    if len(identifiers) != len(set(identifiers)):
        raise ValidationError({key: "No repitas registros en el mismo corte."})
    records = model.objects.filter(project=project, id__in=identifiers).in_bulk()
    if len(records) != len(identifiers):
        raise ValidationError({key: "Hay registros que no pertenecen al proyecto seleccionado."})
    return records


@transaction.atomic
def save_cut(*, user, data, cut=None):
    if not accessible_projects(user).filter(pk=data["project"]).exists():
        raise PermissionDenied("No tienes acceso a este proyecto activo.")
    if cut is None:
        # Serialize creation request keys, even when a retry changes its project.
        type(user).objects.select_for_update().get(pk=user.pk)
    # Serialize writes within a project, including cumulative quantities in other cuts.
    project = Project.objects.select_for_update().get(pk=data["project"])
    editing = cut is not None
    fingerprint = hashlib.sha256(json.dumps(data, cls=DjangoJSONEncoder, sort_keys=True).encode()).hexdigest()
    if not editing:
        existing = Cut.objects.filter(author=user, request_id=data["request_id"]).first()
        if existing:
            if existing.creation_fingerprint != fingerprint:
                raise VersionConflict("Esta solicitud ya creó un corte con otros valores. Consulta la lista antes de reenviar.")
            return existing
    if editing:
        cut = Cut.objects.select_for_update().get(pk=cut.pk)
        if not can_edit_cut(user, cut):
            raise PermissionDenied("Solo el residente autor puede editar este corte.")
        if cut.project_id != project.id:
            raise ValidationError({"project": "El proyecto de un corte existente no puede cambiar."})
        if cut.version != data["version"]:
            raise VersionConflict()
    front = Front.objects.filter(pk=data["front"], project=project).first()
    if front is None:
        raise ValidationError({"front": "El frente no pertenece al proyecto."})
    activities = resolve_entries(Activity, project, data["activities"], "activity")
    workers = resolve_entries(Worker, project, data["labor"], "worker")
    supplies = resolve_entries(Supply, project, data["supplies"], "supply")
    activity_snapshots = []
    for row in data["activities"]:
        activity = activities[row["activity"]]
        other_entries = ActivityEntry.objects.filter(activity=activity, cut__period_end__lte=data["period_end"])
        if editing:
            other_entries = other_entries.exclude(cut=cut)
        previous = other_entries.aggregate(total=Sum("quantity"))["total"] or Decimal("0")
        accumulated = previous + row["quantity"]
        activity_snapshots.append({
            "activity": activity.id, "code": activity.code, "name": activity.name, "unit": activity.unit,
            "quantity": str(row["quantity"]), "planned_quantity": str(activity.planned_quantity),
            "accumulated_at_save": str(accumulated),
            "progress_at_save": str(round(accumulated / activity.planned_quantity * 100, 2)),
        })
    fields = dict(front=front, period_start=data["period_start"], period_end=data["period_end"],
                  notes=data["notes"], status=Cut.Status.REVIEW)
    if editing:
        # Conditional update also rejects stale versions on backends without row locks.
        updated = Cut.objects.filter(pk=cut.pk, version=data["version"]).update(
            **fields, version=cut.version + 1, updated_at=timezone.now(),
        )
        if not updated:
            raise VersionConflict()
        cut.refresh_from_db()
        cut.activity_entries.all().delete()
        cut.labor_entries.all().delete()
        cut.supply_entries.all().delete()
    else:
        cut = Cut.objects.create(project=project, author=user, request_id=data["request_id"],
                                 creation_fingerprint=fingerprint, **fields)
    ActivityEntry.objects.bulk_create([
        ActivityEntry(cut=cut, activity_id=row["activity"], quantity=row["quantity"])
        for row in data["activities"]
    ])
    LaborEntry.objects.bulk_create([
        LaborEntry(cut=cut, worker_id=row["worker"], hours=row["hours"]) for row in data["labor"]
    ])
    SupplyEntry.objects.bulk_create([
        SupplyEntry(cut=cut, supply_id=row["supply"], quantity=row["quantity"]) for row in data["supplies"]
    ])
    snapshot = {
        "project": project.id, "project_name": str(project), "front": front.id, "front_name": front.name,
        "period_start": cut.period_start.isoformat(), "period_end": cut.period_end.isoformat(),
        "notes": cut.notes, "status": cut.status, "activities": activity_snapshots,
        "labor": [{"worker": row["worker"], "name": workers[row["worker"]].name,
                   "hours": str(row["hours"])} for row in data["labor"]],
        "supplies": [{"supply": row["supply"], "name": supplies[row["supply"]].name,
                      "unit": supplies[row["supply"]].unit, "quantity": str(row["quantity"])}
                     for row in data["supplies"]],
        "total_hours": str(sum((row["hours"] for row in data["labor"]), Decimal("0"))),
    }
    CutRevision.objects.create(
        cut=cut, version=cut.version, editor=user, editor_name=str(user),
        editor_role=user.get_role_display(), snapshot=snapshot,
        reason=data["reason"] if editing else "Registro inicial del corte",
    )
    return cut


@transaction.atomic
def transition_cut(*, cut, user, status, reason, expected_version):
    """Integration point for HU-M04. A state change always records a new revision."""
    from accounts.models import User

    if user.role != User.Role.DIRECTOR or not accessible_projects(user).filter(pk=cut.project_id).exists():
        raise PermissionDenied("El visado corresponde al Director de Proyectos asignado.")
    Project.objects.select_for_update().get(pk=cut.project_id)
    cut = Cut.objects.select_for_update().get(pk=cut.pk)
    if cut.version != expected_version:
        raise VersionConflict()
    if status not in {Cut.Status.APPROVED, Cut.Status.OBSERVED} or cut.status != Cut.Status.REVIEW:
        raise ValidationError("Solo se puede visar o devolver un corte en revisión.")
    if len(reason.strip()) < 10:
        raise ValidationError("Registra un motivo de al menos 10 caracteres.")
    snapshot = dict(cut.revisions.first().snapshot)
    snapshot["status"] = status
    updated = Cut.objects.filter(pk=cut.pk, version=expected_version).update(
        status=status, version=expected_version + 1, updated_at=timezone.now(),
    )
    if not updated:
        raise VersionConflict()
    cut.refresh_from_db()
    CutRevision.objects.create(
        cut=cut, version=cut.version, editor=user, editor_name=str(user), editor_role=user.get_role_display(),
        reason=reason.strip(), snapshot=snapshot,
    )
    return cut
