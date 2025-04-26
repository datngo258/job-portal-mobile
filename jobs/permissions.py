from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
#Mọi người chỉ được đọc, còn admin thì được thay đổi
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsCompanyOwner(permissions.BasePermission):
# Cho chủ sở hữu công ty được thay đổi thông tin công ty của mình
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class IsApplicationOwner(permissions.BasePermission):
# cho ứng viên hoặc coong ty đăng job được sữa thông tin.
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.candidate == request.user or obj.job.company.user == request.user


# là admin
class IsAdmin(permissions.BasePermission):
        def has_permission(self, request, view):
            return request.user.user_type == 'admin' and request.user.is_authenticated
# chủ sở hữu công ty là nhà tuyển dụng
class IsEmployerAndOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        # Cho phép nhà tuyển dụng đã đăng nhập tiếp tục thao tác
        return request.user.is_authenticated and request.user.user_type == 'employer'

    def has_object_permission(self, request, view, obj):
        # Chỉ cho phép nếu job là của công ty thuộc user
        return obj.company.user == request.user
# là nhà tuyển dụng
class IsEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type == 'employer'