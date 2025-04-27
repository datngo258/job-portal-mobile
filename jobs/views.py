from django.shortcuts import render
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import viewsets, permissions, status, parsers, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
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
User = get_user_model()
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.DestroyAPIView, generics.UpdateAPIView, generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, FormParser, JSONParser]  # Cho phép upload file

    def get_permissions(self):
        if self.action == 'current_user':
            return [permissions.IsAuthenticated()]  # Phải đăng nhập để xem thông tin của chính mình
        elif self.action == 'destroy' or self.action == 'list':
            return [permissions.IsAdminUser()]  # Chỉ admin mới có quyền xóa hoặc xem danh sách user
        elif self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated()]  # Phải đăng nhập để cập nhật thông tin user
        return [permissions.AllowAny()]  # Cho phép bất kỳ ai thực hiện các hành động khác

    @action(detail=False, methods=['get'], url_name='current_user')
    def current_user(self, request):
        """ Lấy thông tin của người dùng hiện tại (yêu cầu phải đăng nhập) """
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
            return Response(status=status.HTTP_204_NO_CONTENT,data={"detail": "Thành công!"} )
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
        return queryset

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsEmployer()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsEmployerAndOwner()]
        return [permissions.IsAuthenticated()]
        # Thêm một action 'my_jobs' để xem các job của chính người dùng

    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        queryset = Job.objects.filter(company__user=request.user)  # company__user là user hiện tại
        serializer = self.get_serializer(queryset, many=True)
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
        user = self.request.user
        if user.user_type == 'admin':
            return Application.objects.all()
        elif user.user_type == 'employer':
            return Application.objects.filter(job__company__user=user)
        return Application.objects.filter(candidate=user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Application.STATUS_CHOICES):
            application.status = new_status
            application.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(
            Q(sender=self.request.user) |
            Q(receiver=self.request.user)
        ).order_by('created_at')

class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(candidate=self.request.user)
