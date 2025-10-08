from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myfx.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('home/forex', TemplateView.as_view(template_name='index.html'), name='forex'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
