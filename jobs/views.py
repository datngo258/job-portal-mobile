from django.shortcuts import render
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
from .permissions import IsAdminOrReadOnly, IsCompanyOwner, IsApplicationOwner, IsAdmin , IsEmployerAndOwner , IsEmployer
User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        company = self.get_object()
        images = request.FILES.getlist('images')
        for image in images:
            CompanyImage.objects.create(company=company, image=image)
        return Response(status=status.HTTP_201_CREATED)

# TÌM KIẾM
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_queryset(self):
        queryset = Job.objects.all()
        job_type = self.request.query_params.get('job_type', None)
        location = self.request.query_params.get('location', None)
        salary_min = self.request.query_params.get('salary_min', None)
        salary_max = self.request.query_params.get('salary_max', None)

        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if salary_min:
            queryset = queryset.filter(salary_min__gte=salary_min)
        if salary_max:
            queryset = queryset.filter(salary_max__lte=salary_max)

        return queryset

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsEmployer()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsEmployerAndOwner()]
        return [permissions.IsAuthenticated()]
class AdminJobViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    serializer_class = JobSerializer

    def list(self, request):
        try:
            jobs = Job.objects.all()
            serializer = JobSerializer(jobs, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            serializer = JobSerializer(data=request.data)
            if serializer.is_valid():
                job = serializer.save()
                return Response({
                    'status': 'success',
                    'data': JobSerializer(job).data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
            serializer = JobSerializer(job, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Job.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
            job.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Job.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)

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
