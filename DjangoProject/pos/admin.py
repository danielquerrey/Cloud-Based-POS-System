from django.contrib import admin
from django.apps import apps

# Register your models here.

pos_models = apps.get_app_config('pos').get_models()

for model in pos_models:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
