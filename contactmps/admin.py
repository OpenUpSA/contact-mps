from django.contrib import admin

from .models import (
    ContactDetail,
    Email,
    Person,
)


admin.site.site_header = 'Contact MPs administration'

admin.site.register(ContactDetail)
admin.site.register(Email)
admin.site.register(Person)
