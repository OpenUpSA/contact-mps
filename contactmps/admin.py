import csv

from django.http import HttpResponse
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
    list_filter = ('created_at', 'campaign', 'moderation_passed')
    list_display = ('from_email', 'to_addresses', 'created_at',
                    'is_sent', 'is_moderated', 'moderation_passed')
    actions = ['export_as_csv']

    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([getattr(obj, field.encode("utf8")) for field in field_names])

        return response
    export_as_csv.short_description = 'Export as csv'



admin.site.site_header = 'Contact Parliament administration'

admin.site.register(Campaign)
admin.site.register(Committee, admin.ModelAdmin)
admin.site.register(ContactDetail, ContactDetailAdmin)
admin.site.register(Email, EmailAdmin)
admin.site.register(Entity, EntityAdmin)
admin.site.register(SenderQA)
