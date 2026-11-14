import uuid
from copy import deepcopy

from django.test import Client, override_settings
from rest_framework.test import APITestCase

from accounts.models import User
from projects.models import Activity, Front, Project, Supply, Worker
from .models import Cut, CutRevision
from .services import transition_cut


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class CutWorkflowTests(APITestCase):
    def setUp(self):
        self.resident = User.objects.create_user("resident@example.test", "test-password", first_name="Residente")
        self.other = User.objects.create_user("other@example.test", "test-password")
        self.director = User.objects.create_user("director@example.test", "test-password", role="director")
        self.quality = User.objects.create_user("quality@example.test", "test-password", role="quality")
        self.sst = User.objects.create_user("sst@example.test", "test-password", role="sst")
        self.project = Project.objects.create(code="P-01", name="Proyecto 1")
        self.project.members.add(self.resident, self.other, self.director, self.quality, self.sst)
        self.front = Front.objects.create(project=self.project, name="Frente A")
        self.activity = Activity.objects.create(project=self.project, code="A1", name="Tubería", unit="m", planned_quantity="100")
        self.worker = Worker.objects.create(project=self.project, name="Operario", identification="001")
        self.supply = Supply.objects.create(project=self.project, name="Soldadura", unit="kg")
        self.payload = {
            "request_id": str(uuid.uuid4()), "project": self.project.id, "front": self.front.id,
            "period_start": "2026-11-01", "period_end": "2026-11-07", "notes": "Corte inicial",
            "activities": [{"activity": self.activity.id, "quantity": "20"}],
            "labor": [{"worker": self.worker.id, "hours": "40"}],
            "supplies": [{"supply": self.supply.id, "quantity": "2.5"}],
        }
        self.client.force_authenticate(self.resident)

    def create_cut(self):
        response = self.client.post("/api/cuts/", self.payload)
        self.assertEqual(response.status_code, 201, response.data)
        return response.data

    def edit_payload(self, version=1):
        return {**deepcopy(self.payload), "version": version, "reason": "Corregir cantidades reportadas"}

    def test_email_login_is_case_insensitive_and_does_not_expose_other_projects(self):
        self.client.force_authenticate(None)
        login = self.client.post("/api/auth/login/", {"email": "RESIDENT@example.test", "password": "test-password"})
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        Project.objects.create(code="SECRET", name="Sin acceso")
        response = self.client.get("/api/projects/")
        self.assertEqual([row["id"] for row in response.data], [self.project.id])

    def test_refresh_rotation_and_logout_revoke_refresh_token(self):
        self.client.force_authenticate(None)
        login = self.client.post("/api/auth/login/", {"email": self.resident.email, "password": "test-password"})
        old_refresh = login.data["refresh"]
        rotated = self.client.post("/api/auth/refresh/", {"refresh": old_refresh})
        self.assertEqual(rotated.status_code, 200)
        self.assertEqual(self.client.post("/api/auth/refresh/", {"refresh": old_refresh}).status_code, 401)
        self.assertEqual(self.client.post("/api/auth/logout/", {"refresh": rotated.data["refresh"]}).status_code, 200)
        self.assertEqual(self.client.post("/api/auth/refresh/", {"refresh": rotated.data["refresh"]}).status_code, 401)

    def test_inactive_user_cannot_login(self):
        self.resident.is_active = False
        self.resident.save()
        self.client.force_authenticate(None)
        response = self.client.post("/api/auth/login/", {"email": self.resident.email, "password": "test-password"})
        self.assertEqual(response.status_code, 401)

    def test_administrator_can_create_an_account_with_email_and_role(self):
        admin = User.objects.create_superuser("admin@example.test", "admin-password")
        browser = Client()
        browser.force_login(admin)
        response = browser.get("/admin/accounts/user/add/")
        self.assertEqual(response.status_code, 200)
        response = browser.post("/admin/accounts/user/add/", {
            "email": "new@example.test", "first_name": "Nueva", "last_name": "Cuenta",
            "role": "quality", "usable_password": "true",
            "password1": "Temporary-Password-2026!", "password2": "Temporary-Password-2026!",
        })
        self.assertEqual(response.status_code, 302, getattr(response, "context", None))
        account = User.objects.get(email="new@example.test")
        self.assertEqual(account.role, "quality")
        self.assertTrue(account.check_password("Temporary-Password-2026!"))

    def test_anonymous_cannot_read_or_write(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/cuts/").status_code, 401)
        self.assertEqual(self.client.post("/api/cuts/", self.payload).status_code, 401)

    def test_create_records_snapshot_totals_and_author(self):
        cut = self.create_cut()
        self.assertEqual(cut["version"], 1)
        self.assertEqual(cut["status"], "review")
        self.assertEqual(cut["data"]["total_hours"], "40.00")
        self.assertEqual(cut["data"]["activities"][0]["progress_at_save"], "20.00")
        self.assertEqual(Cut.objects.get().author, self.resident)
        self.assertEqual(CutRevision.objects.count(), 1)

    def test_retry_same_creation_is_idempotent_and_changed_payload_conflicts(self):
        first = self.create_cut()
        second = self.client.post("/api/cuts/", self.payload)
        self.assertEqual(second.data["id"], first["id"])
        self.assertEqual(Cut.objects.count(), 1)
        self.assertEqual(CutRevision.objects.count(), 1)
        self.payload["notes"] = "Otro contenido"
        self.assertEqual(self.client.post("/api/cuts/", self.payload).status_code, 409)

    def test_roles_cannot_write_or_read_unauthorized_modules(self):
        cut = self.create_cut()
        for user in [self.director, self.quality]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(f"/api/cuts/{cut['id']}/").status_code, 200)
            self.assertEqual(self.client.post("/api/cuts/", self.payload).status_code, 403)
        self.client.force_authenticate(self.sst)
        self.assertEqual(self.client.get("/api/cuts/").status_code, 403)
        self.assertEqual(self.client.get(f"/api/cuts/{cut['id']}/history/").status_code, 403)

    def test_unassigned_project_is_hidden_in_detail_history_and_catalogs(self):
        cut = self.create_cut()
        self.project.members.remove(self.resident)
        for path in [f"/api/cuts/{cut['id']}/", f"/api/cuts/{cut['id']}/history/", f"/api/projects/{self.project.id}/catalogs/"]:
            self.assertEqual(self.client.get(path).status_code, 404)
        self.assertEqual(self.client.post("/api/cuts/", self.payload).status_code, 403)

    def test_resident_cannot_edit_another_authors_cut(self):
        cut = self.create_cut()
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.put(f"/api/cuts/{cut['id']}/", self.edit_payload()).status_code, 403)

    def test_edit_keeps_original_values_and_rejects_stale_version(self):
        cut = self.create_cut()
        payload = self.edit_payload()
        payload["activities"][0]["quantity"] = "35"
        response = self.client.put(f"/api/cuts/{cut['id']}/", payload)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["version"], 2)
        self.assertEqual(self.client.put(f"/api/cuts/{cut['id']}/", payload).status_code, 409)
        history = self.client.get(f"/api/cuts/{cut['id']}/history/").data
        self.assertEqual([row["version"] for row in history], [2, 1])
        self.assertEqual(history[1]["snapshot"]["activities"][0]["quantity"], "20.000")
        self.assertEqual(history[0]["snapshot"]["activities"][0]["quantity"], "35.000")
        self.assertTrue(history[0]["editor_name"])
        self.assertTrue(history[0]["created_at"])

    def test_edit_of_approved_cut_returns_to_review_and_preserves_approval(self):
        created = self.create_cut()
        cut = Cut.objects.get(pk=created["id"])
        transition_cut(cut=cut, user=self.director, status=Cut.Status.APPROVED,
                       reason="Visado técnico conforme", expected_version=1)
        response = self.client.put(f"/api/cuts/{cut.id}/", self.edit_payload(version=2))
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "review")
        self.assertEqual(response.data["version"], 3)
        approved = CutRevision.objects.get(cut=cut, version=2)
        self.assertEqual(approved.snapshot["status"], "approved")
        self.assertEqual(approved.editor, self.director)

    def test_cross_project_catalog_ids_and_duplicates_are_rejected_atomically(self):
        other_project = Project.objects.create(code="P2", name="Otro proyecto")
        other_activity = Activity.objects.create(project=other_project, code="A2", name="Otra", unit="m", planned_quantity=10)
        self.payload["activities"][0]["activity"] = other_activity.id
        self.assertEqual(self.client.post("/api/cuts/", self.payload).status_code, 400)
        self.payload["activities"] = [{"activity": self.activity.id, "quantity": "10"}] * 2
        self.assertEqual(self.client.post("/api/cuts/", self.payload).status_code, 400)
        self.assertEqual(Cut.objects.count(), 0)
        self.assertEqual(CutRevision.objects.count(), 0)

    def test_invalid_dates_quantities_and_hours_are_rejected(self):
        invalid = [
            {"period_end": "2026-10-31"},
            {"activities": [{"activity": self.activity.id, "quantity": "0"}]},
            {"activities": []},
            {"labor": [{"worker": self.worker.id, "hours": "169"}]},
            {"labor": []},
            {"supplies": [{"supply": self.supply.id, "quantity": "-1"}]},
        ]
        for patch in invalid:
            response = self.client.post("/api/cuts/", {**self.payload, **patch})
            self.assertEqual(response.status_code, 400, response.data)
        self.assertEqual(Cut.objects.count(), 0)

    def test_edits_require_reason_and_version_and_cannot_change_project(self):
        cut = self.create_cut()
        self.assertEqual(self.client.put(f"/api/cuts/{cut['id']}/", self.payload).status_code, 400)
        other_project = Project.objects.create(code="P2", name="Otro proyecto")
        other_project.members.add(self.resident)
        payload = {**self.edit_payload(), "project": other_project.id}
        self.assertEqual(self.client.put(f"/api/cuts/{cut['id']}/", payload).status_code, 400)
        self.assertEqual(CutRevision.objects.count(), 1)

    def test_accumulated_quantity_uses_current_cut_values_without_double_counting(self):
        cut = self.create_cut()
        second = deepcopy(self.payload)
        second["request_id"] = str(uuid.uuid4())
        second["activities"][0]["quantity"] = "30"
        response = self.client.post("/api/cuts/", second)
        self.assertEqual(response.data["data"]["activities"][0]["accumulated_at_save"], "50.000")
        edit = self.edit_payload()
        edit["activities"][0]["quantity"] = "25"
        response = self.client.put(f"/api/cuts/{cut['id']}/", edit)
        self.assertEqual(response.data["data"]["activities"][0]["accumulated_at_save"], "55.000")

    def test_actual_quantity_can_exceed_planned_quantity(self):
        self.payload["activities"][0]["quantity"] = "105"
        response = self.create_cut()
        self.assertEqual(response["data"]["activities"][0]["progress_at_save"], "105.00")

    def test_accumulated_quantity_excludes_later_periods(self):
        self.create_cut()
        earlier = deepcopy(self.payload)
        earlier.update(request_id=str(uuid.uuid4()), period_start="2026-10-01", period_end="2026-10-07")
        earlier["activities"][0]["quantity"] = "5"
        response = self.client.post("/api/cuts/", earlier)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["data"]["activities"][0]["accumulated_at_save"], "5.000")

    def test_no_delete_or_history_mutation_endpoints(self):
        cut = self.create_cut()
        self.assertEqual(self.client.delete(f"/api/cuts/{cut['id']}/").status_code, 405)
        self.assertEqual(self.client.post(f"/api/cuts/{cut['id']}/history/", {}).status_code, 405)
        revision = CutRevision.objects.get()
        revision.reason = "Intento de reemplazo"
        with self.assertRaises(ValueError):
            revision.save()
