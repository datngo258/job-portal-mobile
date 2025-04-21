from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Company, CompanyImage, Job,
    Application, Review, ChatMessage, Follow
)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'created_at')
    list_filter = ('user_type', 'is_verified')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)

class CompanyImageInline(admin.TabularInline):
    model = CompanyImage
    extra = 1

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'tax_code', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('name', 'tax_code')
    inlines = [CompanyImageInline]
    ordering = ('-created_at',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'job_type', 'location', 'is_active', 'created_at')
    list_filter = ('job_type', 'is_active')
    search_fields = ('title', 'company__name', 'location')
    ordering = ('-created_at',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'candidate', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('job__title', 'candidate__username')
    ordering = ('-applied_at',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('application', 'rating', 'is_employer_review', 'created_at')
    list_filter = ('rating', 'is_employer_review')
    search_fields = ('application__job__title', 'application__candidate__username')
    ordering = ('-created_at',)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'receiver__username')
    ordering = ('-created_at',)

@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'company', 'created_at')
    search_fields = ('candidate__username', 'company__name')
    ordering = ('-created_at',)
