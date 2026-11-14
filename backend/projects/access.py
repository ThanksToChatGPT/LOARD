def accessible_projects(user):
    from .models import Project

    projects = Project.objects.filter(active=True)
    if user.is_superuser:
        return projects
    return projects.filter(members=user)
