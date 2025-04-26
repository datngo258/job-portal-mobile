# from django.db import models
# from django.contrib.auth.models import AbstractUser
# from django.core.validators import MinValueValidator, MaxValueValidator
# from cloudinary.models import CloudinaryField
# from jobs.models import Job
#
# class User(AbstractUser):
#     ROLE_CHOICES = [
#         ('admin', 'Admin'),
#         ('employer', 'Employer'),
#         ('candidate', 'Candidate'),
#     ]
#     STATUS_CHOICES = [
#         ('active', 'Active'),
#         ('inactive', 'Inactive'),
#         ('banned', 'Banned'),
#     ]
#
#     email = models.EmailField(unique=True)
#     phone_number = models.CharField(max_length=20, blank=True, null=True)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
#     avatar = CloudinaryField('avatar', default='v1234567890/default-avatar.png')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#
#     def __str__(self):
#         return f"{self.username} ({self.role})"
#
# class Admin(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
#     ADMIN_LEVEL_CHOICES = [
#         ('super', 'Super Admin'),
#         ('moderator', 'Moderator'),
#         ('support', 'Support'),
#     ]
#     admin_level = models.CharField(max_length=20, choices=ADMIN_LEVEL_CHOICES)
#     created_at = models.DateTimeField(auto_now_add=True)
#
# class Company(models.Model):
#     name = models.CharField(max_length=255)
#     address = models.TextField()
#     website = models.URLField(null=True, blank=True)
#     tax_code = models.CharField(max_length=50, unique=True)
#     description = models.TextField(null=True, blank=True)
#     VERIFICATION_STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('verified', 'Verified'),
#         ('rejected', 'Rejected'),
#     ]
#     verification_status = models.CharField(
#         max_length=20,
#         choices=VERIFICATION_STATUS_CHOICES,
#         default='pending'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#
#     def __str__(self):
#         return self.name
#
# class CompanyImage(models.Model):
#     company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='images')
#     image = models.ImageField(upload_to='company_images/')
#     created_at = models.DateTimeField(auto_now_add=True)
#
# class Employer(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
#     company = models.ForeignKey(Company, on_delete=models.CASCADE)
#     position = models.CharField(max_length=100)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.user.username} - {self.company.name}"
#
# class Candidate(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
#     date_of_birth = models.DateField(null=True, blank=True)
#     GENDER_CHOICES = [
#         ('male', 'Male'),
#         ('female', 'Female'),
#         ('other', 'Other'),
#     ]
#     gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
#     address = models.TextField(null=True, blank=True)
#     cv = models.FileField(upload_to='cvs/', null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#
#     def __str__(self):
#         return self.user.username
#
# class JobApplication(models.Model):
#     job = models.ForeignKey(Job, on_delete=models.CASCADE)
#     candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
#     cover_letter = models.TextField(null=True, blank=True)
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('accepted', 'Accepted'),
#         ('rejected', 'Rejected'),
#     ]
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     applied_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#
# class Review(models.Model):
#     job_application = models.ForeignKey(JobApplication, on_delete=models.CASCADE)
#     # người đánh giá
#     reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
#     # người được đánh giá
#     reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
#     rating = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(5)]
#     )
#     comment = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#
# class CompanyFollower(models.Model):
#     candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
#     company = models.ForeignKey(Company, on_delete=models.CASCADE)
#     followed_at = models.DateTimeField(auto_now_add=True)
#
#     class Meta:
#         unique_together = ('candidate', 'company')
#
# class Chat(models.Model):
#     employer = models.ForeignKey(Employer, on_delete=models.CASCADE)
#     candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)
#
# class ChatMessage(models.Model):
#     chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
#     sender = models.ForeignKey(User, on_delete=models.CASCADE)
#     content = models.TextField()
#     is_read = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#
# class Notification(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     title = models.CharField(max_length=255)
#     content = models.TextField()
#     TYPE_CHOICES = [
#         ('application', 'Application'),
#         ('message', 'Message'),
#         ('review', 'Review'),
#         ('job', 'Job'),
#     ]
#     type = models.CharField(max_length=50, choices=TYPE_CHOICES)
#     is_read = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)