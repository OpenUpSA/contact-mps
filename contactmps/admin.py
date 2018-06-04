from django.contrib import admin

from .models import (
    Campaign,
    Committee,
    ContactDetail,
    Email,
    Entity,
    SenderQA
)


class ContactDetailInline(admin.TabularInline):
    model = ContactDetail


class EntityAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at', 'updated_at']
    inlines = (ContactDetailInline, )


class ContactDetailAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at', 'updated_at']


class EmailAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ('created_at', 'campaign')
    list_display = ('from_email', 'to_addresses', 'created_at',
                    'is_sent', 'is_moderated')


admin.site.site_header = 'Contact Parliament administration'

admin.site.register(Campaign)
admin.site.register(Committee, admin.ModelAdmin)
admin.site.register(ContactDetail, ContactDetailAdmin)
admin.site.register(Email, EmailAdmin)
admin.site.register(Entity, EntityAdmin)
admin.site.register(SenderQA)
