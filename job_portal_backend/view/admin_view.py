from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import JobPosting, Employer
from ..jobs.serializers import JobPostingSerializer
from .. import IsAdmin

class AdminJobPostingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = JobPostingSerializer

    def list(self, request):
        try:
            jobs = JobPosting.objects.all()
            serializer = JobPostingSerializer(jobs, many=True)
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
            serializer = JobPostingSerializer(data=request.data)
            if serializer.is_valid():
                job = serializer.save()
                return Response({
                    'status': 'success',
                    'data': JobPostingSerializer(job).data
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
            job = JobPosting.objects.get(pk=pk)
            serializer = JobPostingSerializer(job, data=request.data)
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
        except JobPosting.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            job = JobPosting.objects.get(pk=pk)
            job.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except JobPosting.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)