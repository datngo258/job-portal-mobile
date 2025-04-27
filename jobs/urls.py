from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, JobViewSet,
    ApplicationViewSet, ReviewViewSet, ChatMessageViewSet,
    FollowViewSet, AdminJobViewSet, AdminCompanyViewSet, EmployerCompanyViewSet,CandidateCompanyViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)

# Company
router.register(r'companies', AdminCompanyViewSet, basename='company-admin')
router.register(r'employer/companies', EmployerCompanyViewSet, basename='employer-company')
router.register(r'candidate/companies',CandidateCompanyViewSet , basename='candidate-company')
#
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