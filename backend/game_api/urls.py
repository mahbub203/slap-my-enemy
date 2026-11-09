from django.urls import path
from .views import (
    HealthCheckView,
    ScenarioListView,
    CharacterGenerateView,
    CharacterDetailDeleteView,
    SessionCleanupView,
    SessionStatsUpdateView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='api-health'),
    path('scenarios/', ScenarioListView.as_view(), name='scenarios-list'),
    path('characters/generate/', CharacterGenerateView.as_view(), name='character-generate'),
    path('characters/<uuid:pk>/', CharacterDetailDeleteView.as_view(), name='character-detail-delete'),
    path('characters/cleanup-session/', SessionCleanupView.as_view(), name='session-cleanup'),
    path('sessions/update-stats/', SessionStatsUpdateView.as_view(), name='session-stats-update'),
]
