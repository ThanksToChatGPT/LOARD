from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from .access import accessible_projects
from .serializers import ActivitySerializer, FrontSerializer, ProjectSerializer, SupplySerializer, WorkerSerializer


class ProjectViewSet(ReadOnlyModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return accessible_projects(self.request.user)

    @action(detail=True)
    def catalogs(self, request, pk=None):
        project = self.get_object()
        return Response({
            "fronts": FrontSerializer(project.fronts.all(), many=True).data,
            "activities": ActivitySerializer(project.activities.all(), many=True).data,
            "workers": WorkerSerializer(project.workers.all(), many=True).data,
            "supplies": SupplySerializer(project.supplies.all(), many=True).data,
        })
