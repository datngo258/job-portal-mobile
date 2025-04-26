from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CompanyViewSet, JobViewSet,
    ApplicationViewSet, ReviewViewSet, ChatMessageViewSet,
    FollowViewSet, AdminJobViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'chat', ChatMessageViewSet)
router.register(r'follows', FollowViewSet)
router.register(r'admin/jobs', AdminJobViewSet, basename='admin-jobs')

urlpatterns = [
    path('', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Đăng nhập
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Làm mới token
] 