from django.contrib import admin
from .models import Quest, UserQuest

# Register your models here.
admin.site.register(Quest)
admin.site.register(UserQuest)