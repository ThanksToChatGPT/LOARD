from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Project(models.Model):
    code = models.CharField("código", max_length=60, unique=True)
    name = models.CharField("nombre", max_length=180)
    active = models.BooleanField("activo", default=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="projects", blank=True)

    def __str__(self):
        return f"{self.code} · {self.name}"


class Front(models.Model):
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name="fronts")
    name = models.CharField("frente", max_length=160)

    def __str__(self):
        return self.name


class Activity(models.Model):
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name="activities")
    code = models.CharField("código", max_length=40)
    name = models.CharField("actividad", max_length=180)
    unit = models.CharField("unidad", max_length=20)
    planned_quantity = models.DecimalField("cantidad prevista", max_digits=14, decimal_places=3,
                                          validators=[MinValueValidator(Decimal("0.001"))])

    # The planned quantity is the denominator used by operational progress.

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["project", "code"], name="unique_project_activity"),
            models.CheckConstraint(condition=models.Q(planned_quantity__gt=0), name="positive_planned_quantity"),
        ]

    def __str__(self):
        return f"{self.code} · {self.name} ({self.unit})"


class Worker(models.Model):
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name="workers")
    name = models.CharField("nombre", max_length=160)
    identification = models.CharField("identificación", max_length=30)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["project", "identification"], name="unique_project_worker")]

    def __str__(self):
        return self.name


class Supply(models.Model):
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name="supplies")
    name = models.CharField("insumo", max_length=180)
    unit = models.CharField("unidad", max_length=20)

    def __str__(self):
        return f"{self.name} ({self.unit})"
