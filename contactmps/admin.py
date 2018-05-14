from django.contrib import admin

from .models import (
    Campaign,
    Committee,
    ContactDetail,
    Email,
    Person,
)


class ContactDetailInline(admin.TabularInline):
    model = ContactDetail
    readonly_fields = [f.name for f in ContactDetail._meta.get_fields()]
    can_delete = False


class PersonAdmin(admin.ModelAdmin):
    readonly_fields = [f.name for f in Person._meta.get_fields() if f.name != 'contactdetails']
    fields = [f.name for f in Person._meta.get_fields() if f.name not in ['email', 'contactdetails']]
    inlines = (ContactDetailInline, )


class ContactDetailAdmin(admin.ModelAdmin):
    readonly_fields = [f.name for f in ContactDetail._meta.get_fields()]


class EmailAdmin(admin.ModelAdmin):
    readonly_fields = [f.name for f in Email._meta.get_fields()]


admin.site.site_header = 'Contact MPs administration'

admin.site.register(Campaign)
admin.site.register(Committee, admin.ModelAdmin)
admin.site.register(ContactDetail, ContactDetailAdmin)
admin.site.register(Email, EmailAdmin)
admin.site.register(Person, PersonAdmin)
