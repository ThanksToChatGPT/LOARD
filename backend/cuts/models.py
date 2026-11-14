from django.conf import settings
from django.db import models


class Cut(models.Model):
    class Status(models.TextChoices):
        REVIEW = "review", "En Revisión (Enviado)"
        APPROVED = "approved", "Visado"
        OBSERVED = "observed", "Devuelto con Observaciones"

    project = models.ForeignKey("projects.Project", on_delete=models.PROTECT, related_name="cuts")
    request_id = models.UUIDField()
    creation_fingerprint = models.CharField(max_length=64, editable=False)
    front = models.ForeignKey("projects.Front", on_delete=models.PROTECT)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    period_start = models.DateField()
    period_end = models.DateField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REVIEW)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        constraints = [models.UniqueConstraint(fields=["author", "request_id"], name="unique_author_cut_request")]


class ActivityEntry(models.Model):
    cut = models.ForeignKey(Cut, on_delete=models.CASCADE, related_name="activity_entries")
    activity = models.ForeignKey("projects.Activity", on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=14, decimal_places=3)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["cut", "activity"], name="unique_cut_activity")]


class LaborEntry(models.Model):
    cut = models.ForeignKey(Cut, on_delete=models.CASCADE, related_name="labor_entries")
    worker = models.ForeignKey("projects.Worker", on_delete=models.PROTECT)
    hours = models.DecimalField(max_digits=9, decimal_places=2)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["cut", "worker"], name="unique_cut_worker")]


class SupplyEntry(models.Model):
    cut = models.ForeignKey(Cut, on_delete=models.CASCADE, related_name="supply_entries")
    supply = models.ForeignKey("projects.Supply", on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=14, decimal_places=3)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["cut", "supply"], name="unique_cut_supply")]


class CutRevision(models.Model):
    cut = models.ForeignKey(Cut, on_delete=models.PROTECT, related_name="revisions")
    version = models.PositiveIntegerField()
    editor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    editor_name = models.CharField(max_length=254)
    editor_role = models.CharField(max_length=60)
    reason = models.TextField()
    snapshot = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version"]
        constraints = [models.UniqueConstraint(fields=["cut", "version"], name="unique_cut_revision")]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Las versiones del corte son de solo lectura.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Las versiones del corte se conservan para auditoría.")
