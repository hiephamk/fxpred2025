
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Prefer myfx endpoints when present
    path('api/', include('myfx.urls')),
    path('api/', include('myfx.urls')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
