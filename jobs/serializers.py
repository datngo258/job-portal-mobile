from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomUser, Company, CompanyImage, Job, 
    Application, Review, ChatMessage, Follow
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'user_type', 'avatar', 
                 'phone_number', 'is_verified', 'created_at')
        read_only_fields = ('is_verified', 'created_at')
        extra_kwargs = {
            'password': {'write_only': True}
        }
        def create(self, validated_data):
            password = validated_data.pop('password')
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user

class CompanyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyImage
        fields = ('id', 'image', 'uploaded_at')

class CompanySerializer(serializers.ModelSerializer):
    images = CompanyImageSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = ('id', 'user', 'name', 'tax_code', 'description', 
                 'address', 'website', 'is_approved', 'created_at', 'images')
        read_only_fields = ('is_approved', 'created_at')

class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    
    class Meta:
        model = Job
        fields = ('id', 'company', 'title', 'description', 'requirements',
                 'salary_min', 'salary_max', 'job_type', 'location',
                 'latitude', 'longitude', 'working_hours', 'is_active',
                 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    candidate = UserSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'job', 'candidate', 'cv', 'cover_letter',
                 'status', 'applied_at', 'updated_at')
        read_only_fields = ('applied_at', 'updated_at')

class ReviewSerializer(serializers.ModelSerializer):
    application = ApplicationSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'application', 'rating', 'comment',
                 'is_employer_review', 'created_at')
        read_only_fields = ('created_at',)

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'sender', 'receiver', 'message',
                 'is_read', 'created_at')
        read_only_fields = ('created_at',)

class FollowSerializer(serializers.ModelSerializer):
    candidate = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'candidate', 'company', 'created_at')
        read_only_fields = ('created_at',) 