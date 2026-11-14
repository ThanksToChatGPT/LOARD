from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import User

READ_ROLES = {User.Role.RESIDENT, User.Role.DIRECTOR, User.Role.QUALITY, User.Role.MANAGEMENT}


def can_edit_cut(user, cut):
    return user.role == User.Role.RESIDENT and cut.author_id == user.id


class CutPermission(BasePermission):
    message = "Tu rol no tiene permiso para esta operación."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_superuser or request.user.role in READ_ROLES
        return request.user.role == User.Role.RESIDENT

    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS or can_edit_cut(request.user, obj)
