"""
URL configuration for DjangoProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include
from users import views as user_views
from users.views import CustomLoginView,  register_staff, register_manager

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', user_views.register, name = 'register'),
    path('register/staff/', register_staff, name = 'register/staff'),
    path('register/manager/', register_manager, name = 'register/manager'),
    path('login', CustomLoginView.as_view(template_name='users/login.html'), name = 'login'),
    path('logout/', auth_views.LogoutView.as_view(), name = 'logout'),
    path("", include("pos.urls")),
    path('auth/', include('social_django.urls', namespace='social')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('users/', user_views.users, name = 'users'),
    path('delete_user/', user_views.delete_user, name = 'delete_user'),
    path('edit_user/<int:user_id>/', user_views.edit_user, name='edit_user'),
    path('submit_edit_user/', user_views.submit_edit_user, name='submit_edit_user'),
    path('admin_landing/', user_views.admin_landing, name='Admin Landing'),
]
