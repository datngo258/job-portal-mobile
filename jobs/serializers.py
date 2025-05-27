from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomUser, Company, CompanyImage, Job, 
    Application, Review, ChatMessage, Follow
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'avatar',
                  'phone_number', 'is_verified', 'created_at', 'password')
        read_only_fields = ('is_verified', 'created_at')
        extra_kwargs = {
            'password': {'write_only': True}  # Chỉ có thể ghi mật khẩu, không thể đọc
        }

    def create(self, validated_data):
        password = validated_data.pop('password')  # Lấy mật khẩu từ dữ liệu đã xác thực
        user = User(**validated_data)  # Tạo đối tượng User
        user.set_password(password)  # Mã hóa mật khẩu
        user.save()  # Lưu user vào cơ sở dữ liệu
        return user

class CompanyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyImage
        fields = ('id', 'image', 'uploaded_at')

class CompanySerializer(serializers.ModelSerializer):
    images = CompanyImageSerializer(many=True, read_only=True)
    user = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Company
        fields = ('id', 'user', 'name', 'tax_code', 'description', 
                 'address', 'website', 'is_approved', 'created_at', 'images')
        read_only_fields = ('is_approved', 'created_at')

class JobSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source='company.name', read_only=True)
    class Meta:
        model = Job
        fields = ('id', 'company', 'title', 'description', 'requirements',
                 'salary_min', 'salary_max', 'job_type', 'location',
                 'latitude', 'longitude', 'working_hours', 'is_active',
                 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

# class ApplicationSerializer(serializers.ModelSerializer):
#     job_id = serializers.PrimaryKeyRelatedField(
#         queryset=Job.objects.all(), source='job', write_only=True
#     )
#     job = serializers.CharField(source='job.title', read_only=True)
#     candidate = serializers.CharField(source='candidate.username', read_only=True)
#
#     class Meta:
#         model = Application
#         fields = ('id', 'job', 'job_id', 'candidate', 'cv', 'cover_letter', 'status', 'applied_at', 'updated_at')
#         read_only_fields = ('applied_at', 'updated_at')
class ApplicationSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), source='job', write_only=True
    )
    job = serializers.SerializerMethodField()
    candidate = serializers.CharField(source='candidate.username', read_only=True)
    class Meta:
        model = Application
        fields = ('id', 'job', 'job_id', 'candidate', 'cv', 'cover_letter', 'status', 'applied_at', 'updated_at')
        read_only_fields = ('applied_at', 'updated_at')
    def get_job(self, obj):
        return {
            "id": obj.job.id,
            "title": obj.job.title
        }
class ReviewSerializer(serializers.ModelSerializer):
    application = serializers.PrimaryKeyRelatedField(queryset=Application.objects.all())
    job_id = serializers.IntegerField(source='application.job.id', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    company_name = serializers.CharField(source='application.job.company.name', read_only=True)

    candidate_id = serializers.IntegerField(source='application.candidate.id', read_only=True)
    candidate_username = serializers.CharField(source='application.candidate.username', read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 'application', 'rating', 'comment',
            'is_employer_review', 'created_at',
            'job_id', 'job_title', 'company_name',
            'candidate_id', 'candidate_username'  # 🛠️ Bổ sung 2 field này vào đây
        )
        read_only_fields = ('created_at',)

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'sender', 'receiver', 'message',
                 'is_read', 'created_at')
        read_only_fields = ('created_at',)
class CompanySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']
class FollowSerializer(serializers.ModelSerializer):
    company = CompanySimpleSerializer(read_only=True)
    class Meta:
        model = Follow
        fields = ('id', 'company', 'created_at')
        read_only_fields = ('created_at',)
