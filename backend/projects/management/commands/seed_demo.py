import os
import uuid
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from cuts.models import Cut
from cuts.serializers import CutInputSerializer
from cuts.services import save_cut, transition_cut
from projects.models import Activity, Front, Project, Supply, Worker


class Command(BaseCommand):
    help = "Create fictional local demo users and catalogs. Existing accounts keep their passwords."

    @transaction.atomic
    def handle(self, *args, **options):
        password = os.environ.get("LOARD_DEMO_PASSWORD")
        if not password or len(password) < 12:
            raise CommandError("Define LOARD_DEMO_PASSWORD con al menos 12 caracteres para los usuarios nuevos.")
        if not settings.DEBUG:
            raise CommandError("Los datos de demostración solo se pueden crear con DJANGO_DEBUG=1.")
        users = {}
        names = {"resident": "Carlos Mendoza", "director": "Yonny Pérez", "quality": "Dilan Castro",
                 "sst": "Sandra Torres", "management": "María Rojas"}
        for role, name in names.items():
            first, last = name.split(" ", 1)
            user, created = User.objects.get_or_create(email=f"{role}@loard.test", defaults={
                "role": role, "first_name": first, "last_name": last,
            })
            if created:
                user.set_password(password)
                user.save()
            users[role] = user
        admin, created = User.objects.get_or_create(email="admin@loard.test", defaults={
            "role": User.Role.MANAGEMENT, "first_name": "Administración", "is_staff": True, "is_superuser": True,
        })
        if created:
            admin.set_password(password)
            admin.save()
        project, _ = Project.objects.get_or_create(code="DEMO-CHEV-2026", defaults={"name": "Línea de conducción · Proyecto de demostración"})
        project.members.add(*users.values())
        front, _ = Front.objects.get_or_create(project=project, name="Frente B · Oleoducto")
        welding, _ = Activity.objects.get_or_create(project=project, code="ACT-001", defaults={
            "name": "Soldadura y tendido de tubería", "unit": "m", "planned_quantity": "1200",
        })
        Activity.objects.get_or_create(project=project, code="ACT-002", defaults={
            "name": "Montaje de soportes metálicos", "unit": "und", "planned_quantity": "80",
        })
        worker, _ = Worker.objects.get_or_create(project=project, identification="DEMO-001", defaults={"name": "Jorge Rivas · Demo"})
        Worker.objects.get_or_create(project=project, identification="DEMO-002", defaults={"name": "Laura Torres · Demo"})
        supply, _ = Supply.objects.get_or_create(project=project, name="Electrodo E7018", defaults={"unit": "kg"})
        Supply.objects.get_or_create(project=project, name="Discos de corte", defaults={"unit": "und"})
        for index, quantity in enumerate(["168", "214", "92"]):
            request_id = uuid.uuid5(uuid.NAMESPACE_URL, f"loard-demo-cut-{index}")
            if Cut.objects.filter(author=users["resident"], request_id=request_id).exists():
                continue
            end = timezone.localdate() - timedelta(days=index * 7)
            serializer = CutInputSerializer(data={
                "request_id": str(request_id), "project": project.id, "front": front.id,
                "period_start": str(end - timedelta(days=6)), "period_end": str(end),
                "notes": "Datos ficticios para explorar el flujo de cortes de obra.",
                "activities": [{"activity": welding.id, "quantity": quantity}],
                "labor": [{"worker": worker.id, "hours": "40"}],
                "supplies": [{"supply": supply.id, "quantity": "12.5"}],
            })
            serializer.is_valid(raise_exception=True)
            cut = save_cut(user=users["resident"], data=serializer.validated_data)
            if index:
                transition_cut(cut=cut, user=users["director"], expected_version=1,
                               status=Cut.Status.APPROVED if index == 1 else Cut.Status.OBSERVED,
                               reason="Revisión técnica de demostración.")
        self.stdout.write(self.style.SUCCESS("Demo lista. Cuentas: resident, director, quality, sst, management y admin @loard.test"))
