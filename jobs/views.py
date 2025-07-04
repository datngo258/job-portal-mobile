from django.shortcuts import render
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import viewsets, permissions, status, parsers, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from dateutil.relativedelta import relativedelta
from .models import (
    Company, CompanyImage, Job, Application,
    Review, ChatMessage, Follow
)
from .serializers import (
    UserSerializer, CompanySerializer, CompanyImageSerializer,
    JobSerializer, ApplicationSerializer, ReviewSerializer,
    ChatMessageSerializer, FollowSerializer
)
from .permissions import IsAdminOrReadOnly, IsCompanyOwner, IsApplicationOwner, IsAdmin , IsEmployerAndOwner , IsEmployer, IsAdminUser, IsEmployerUser
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.db.models import Count
from datetime import datetime, timedelta
User = get_user_model()
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action == 'current_user':
            return [permissions.IsAuthenticated()]
        elif self.action in ['destroy', 'list']:
            return [permissions.IsAdminUser()]
        elif self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        elif self.action == 'create':
            return [permissions.AllowAny()]  # ✅ Cho phép bất kỳ ai đăng ký
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'], url_name='current_user')
    def current_user(self, request):
        return Response(UserSerializer(request.user).data)
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if request.user.is_staff or request.user == user:
            serializer = self.get_serializer(user, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        else:
            return Response({"detail": "Bạn không có quyền sửa người dùng này."}, status=403)

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        if request.user.is_staff or request.user == user:
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        else:
            return Response({"detail": "Bạn không có quyền sửa người dùng này."}, status=403)

    def destroy(self, request, *args, **kwargs):
        """ Xóa người dùng (chỉ admin mới có quyền) """
        user = self.get_object()  # Lấy đối tượng user dựa trên ID
        if request.user.is_staff:
            return super().destroy(request, *args, **kwargs)
        return Response({"detail": "Bạn không có quyền xóa người dùng này."}, status=403)

class AdminCompanyViewSet(viewsets.ViewSet , generics.ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminUser]
    def destroy(self, request, pk=None):
        try:
            company = self.get_object()
            company.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Company.DoesNotExist:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)
    # Action để duyệt công ty (approve)
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        company = self.get_object()
        company.is_approved = True
        company.save()
        return Response({'status': 'Company approved'})

    # Action để từ chối công ty (disapprove)
    @action(detail=True, methods=['patch'])
    def disapprove(self, request, pk=None):
        company = self.get_object()
        company.is_approved = False
        company.save()
        return Response({'status': 'Company disapproved'})
class CandidateCompanyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
class EmployerCompanyViewSet(viewsets.ViewSet, generics.ListAPIView):

    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployerUser]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Company.objects.none()
        return Company.objects.filter(user=self.request.user)

    def create(self, request):
        # Kiểm tra xem người dùng đã có công ty chưa
        if Company.objects.filter(user=self.request.user).exists():
            return Response({"detail": "Người dùng đã có công ty."}, status=status.HTTP_400_BAD_REQUEST)
        # kiểm tra sl ảnh
        images = request.FILES.getlist('images')
        if len(images) < 3:
            return Response({"detail": "Phải upload ít nhất 3 ảnh môi trường làm việc."},
                            status=status.HTTP_400_BAD_REQUEST)
        # Nếu chưa có công ty, tạo mới công ty
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save(user=request.user)  # Lưu công ty
            # Sau khi lưu công ty, lưu ảnh
            for image in images:
                CompanyImage.objects.create(company=company, image=image)
            return Response(self.get_serializer(company).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @action(detail=True, methods=['patch'])
    def update_company(self, request, pk=None):
        company = self.get_queryset().filter(id=pk).first()
        # Kiểm tra nếu công ty không tồn tại
        if company is None:
            return Response({"detail": "Công ty không tồn tại hoặc không có quyền sửa công ty này."}, status=status.HTTP_404_NOT_FOUND)

        # Cập nhật thông tin công ty với dữ liệu mới
        serializer = self.get_serializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        company = self.get_queryset().filter(id=pk).first()
        if company is None:
            return Response({"detail": "Công ty không tồn tại hoặc không có quyền xóa công ty này."},
                            status=status.HTTP_404_NOT_FOUND)
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT, data={"Xóa thành công!"})
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def perform_create(self, serializer):
        employer = self.request.user  # Giả sử user hiện tại là employer
        company = employer.company  # Lấy company của employer
        serializer.save(company=company)

    def get_queryset(self):
        queryset = Job.objects.all()
        job_type = self.request.query_params.get('job_type', None)
        location = self.request.query_params.get('location', None)
        salary_min = self.request.query_params.get('salary_min', None)
        salary_max = self.request.query_params.get('salary_max', None)
        working_hours = self.request.query_params.get('working_hours', None)
        company_name = self.request.query_params.get('company_name', None)
        company_id = self.request.query_params.get("company_id")
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if salary_min:
            queryset = queryset.filter(salary_min__gte=salary_min)
        if salary_max:
            queryset = queryset.filter(salary_max__lte=salary_max)
        if working_hours:
            queryset = queryset.filter(working_hours=working_hours)
        if company_name:
            queryset = queryset.filter(company__name__icontains=company_name)
        if company_id:
            queryset = queryset.filter(company__id=company_id)
        return queryset

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsEmployer()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsEmployerAndOwner()]
        return [permissions.IsAuthenticated()]
    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        queryset = Job.objects.filter(company__user=request.user)  # company__user là user hiện tại
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='applications')
    def applications(self, request, pk=None):
        job = self.get_object()
        applications = Application.objects.filter(job=job)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)
class AdminJobViewSet(viewsets.ViewSet, generics.ListAPIView , generics.DestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAdmin]
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # def create(self, request, *args, **kwargs):
    #     try:
    #         return super().create(request, *args, **kwargs)
    #     except Exception as e:
    #         return Response({
    #             'status': 'error',
    #             'message': str(e)
    #         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # def update(self, request, *args, **kwargs):
    #     try:
    #         return super().update(request, *args, **kwargs)
    #     except Exception as e:
    #         return Response({
    #             'status': 'error',
    #             'message': str(e)
    #         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Application.objects.none()
        user = self.request.user
        queryset = Application.objects.all()

        # Lọc theo quyền user
        if user.user_type == 'admin':
            queryset = Application.objects.all()
        elif user.user_type == 'employer':
            queryset = Application.objects.filter(job__company__user=user)
        else:
            queryset = Application.objects.filter(candidate=user)

        # Lọc theo job_id nếu được truyền từ query param
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job__id=job_id)

        return queryset
    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        user = request.user
        if user.user_type != 'employer' or application.job.company.user != user:
            return Response({"detail": "Bạn không có quyền thay đổi trạng thái đơn ứng tuyển này."},
                            status=status.HTTP_403_FORBIDDEN)
        new_status = request.data.get('status')
        if new_status in dict(Application.STATUS_CHOICES):
            application.status = new_status
            application.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    # permission_classes = [permissions.IsAuthenticated]
    def get_permissions(self):
        if self.request.user.is_staff:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Review.objects.all()
        return Review.objects.filter(application__candidate=user) | Review.objects.filter(application__job__company__user=user)
    def create(self, request, *args, **kwargs):
        user = request.user
        application_id = request.data.get('application')

        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            return Response({"detail": "Không có đơn tuyển dụng như đã gửi. "}, status=status.HTTP_404_NOT_FOUND)

        if application.status != 'completed':
            return Response({"detail": "Bạn chỉ có thể xem xét các đơn đã hoàn thành."},
                            status=status.HTTP_400_BAD_REQUEST)
        # Check quyền review:
        if user == application.candidate:
            is_employer_review = False  # ứng viên review công ty
        elif user == application.job.company.user:
            is_employer_review = True  # employer review ứng viên
        else:
            return Response({"detail": "Bạn không có quyền đánh giá đơn này."},
                            status=status.HTTP_403_FORBIDDEN)
        # Tạo review
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_employer_review=is_employer_review, application=application)


        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        review = self.get_object()
        user = self.request.user
        if not (user.is_staff or
                user == review.application.candidate or
                user == review.application.job.company.user):
            return Response({"detail": "Bạn không có quyền sửa đánh giá này."}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not (user.is_staff or
                user == instance.application.candidate or
                user == instance.application.job.company.user):
            return Response({"detail": "Bạn không có quyền xóa đánh giá này."}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()

    @action(detail=False, methods=['get'])
    def by_job(self, request):
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({"detail": "Thiếu tham số job_id"}, status=400)

        reviews = self.get_queryset().filter(application__job_id=job_id)

        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(
            Q(sender=self.request.user) |
            Q(receiver=self.request.user)
        ).order_by('created_at')

class FollowViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.user_type == "admin":
            return Follow.objects.all()
        elif user.user_type == "employer":
            # Nhà tuyển dụng: xem ai đang follow các công ty mà mình quản lý
            return Follow.objects.filter(company__user=user)
        else:
            # Ứng viên: chỉ xem các follow mà mình đã follow
            return Follow.objects.filter(candidate=user)
    @action(methods=['post'], detail=True, url_path='toggle-follow')
    def toggle_follow(self, request, pk=None):
        user = request.user
        # Chỉ ứng viên mới có quyền follow công ty
        if user.user_type != 'candidate':
            return Response({"detail": "Chỉ ứng viên mới có thể theo dõi công ty."}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            return Response({"detail": "Không tìm thấy công ty."}, status=status.HTTP_404_NOT_FOUND)
        follow, created = Follow.objects.get_or_create(candidate=user, company=company)
        if not created:
            # Đã follow rồi thì unfollow
            follow.delete()
            return Response({"detail": "Bỏ theo dõi thành công."}, status=status.HTTP_200_OK) 
        return Response({"detail": "Theo dõi thành công."}, status=status.HTTP_201_CREATED)



#Api dùnddeerthoosng kê sl nhà tuyển dụng , công vịệc ,ứng viên trong 4 tháng gần nhất
class StatisticsView(APIView):
    def get(self, request):
        today = datetime.today()
        start_date = today - timedelta(days=120)

        jobs_per_month = (
            Job.objects.filter(created_at__gte=start_date)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        candidates_per_month = (
            User.objects.filter(date_joined__gte=start_date, user_type='candidate')
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        employers_per_month = (
            User.objects.filter(date_joined__gte=start_date, user_type='employer')
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        months = []
        jobs = []
        candidates = []
        employers = []

        month_iter = start_date.replace(day=1)
        while month_iter <= today:
            months.append(month_iter.strftime('%b'))

            job_count = next(
                (item['count'] for item in jobs_per_month if item['month'].strftime('%b') == month_iter.strftime('%b')),
                0)
            candidate_count = next(
                (item['count'] for item in candidates_per_month if item['month'].strftime('%b') == month_iter.strftime('%b')),
                0)
            employer_count = next(
                (item['count'] for item in employers_per_month if item['month'].strftime('%b') == month_iter.strftime('%b')),
                0)

            jobs.append(job_count)
            candidates.append(candidate_count)
            employers.append(employer_count)

            month_iter += relativedelta(months=1)

        return Response({
            "months": months,
            "jobs": jobs,
            "candidates": candidates,
            "employers": employers
        })