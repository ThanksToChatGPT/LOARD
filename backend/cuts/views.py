from django.db import OperationalError
from django.db.models import Prefetch
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from projects.access import accessible_projects
from .models import Cut, CutRevision
from .permissions import CutPermission
from .serializers import CutInputSerializer, CutSerializer, RevisionSerializer
from .services import save_cut, VersionConflict


class CutViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = CutSerializer
    permission_classes = [IsAuthenticated, CutPermission]
    http_method_names = ["get", "post", "put", "head", "options"]

    def get_queryset(self):
        queryset = Cut.objects.filter(project__in=accessible_projects(self.request.user)).select_related(
            "project", "front", "author",
        ).prefetch_related(Prefetch("revisions", queryset=CutRevision.objects.order_by("-version")[:1],
                                    to_attr="current_revisions"))
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id) if project_id.isdecimal() else queryset.none()
        return queryset

    def create(self, request):
        serializer = CutInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cut = self.persist(serializer.validated_data)
        return Response(self.get_serializer(cut).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        cut = self.get_object()
        serializer = CutInputSerializer(data=request.data, context={"editing": True})
        serializer.is_valid(raise_exception=True)
        cut = self.persist(serializer.validated_data, cut=cut)
        return Response(self.get_serializer(cut).data)

    def persist(self, data, cut=None):
        try:
            return save_cut(user=self.request.user, data=data, cut=cut)
        except OperationalError as error:
            if "database is locked" in str(error).lower():
                raise VersionConflict("Hay otro guardado en curso. Tu borrador se conserva. Intenta de nuevo.") from error
            raise

    @action(detail=True)
    def history(self, request, pk=None):
        return Response(RevisionSerializer(self.get_object().revisions.all(), many=True).data)
