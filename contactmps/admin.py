import xlwt
import datetime

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
    list_filter = ('created_at', 'campaign', 'moderation_passed',
                   'is_moderated')
    list_display = ('from_email', 'to_addresses', 'created_at',
                    'is_sent', 'is_moderated', 'moderation_passed')
    actions = ['export_as_excel']

    def export_as_excel(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = 'attachment; filename="emails.xls"'
        work_book = xlwt.Workbook(encoding='utf-8')
        work_sheet = work_book.add_sheet("Emails Submissions")
        row_num = 0
        for col_num in range(len(field_names)):
            work_sheet.write(row_num, col_num, field_names[col_num])

        for obj in queryset.values_list():
            row_num += 1
            for col_num in range(len(obj)):
                if isinstance(obj[col_num], datetime.datetime):
                    work_sheet.write(row_num,
                                     col_num,
                                     str(obj[col_num]))
                elif isinstance(obj[col_num], dict):
                    work_sheet.write(row_num,
                                     col_num,
                                     str(obj[col_num]))
                else:
                    work_sheet.write(row_num,
                                     col_num,
                                     obj[col_num])
        work_book.save(response)

        return response
    export_as_excel.short_description = 'Export as excel'



admin.site.site_header = 'Contact Parliament administration'

admin.site.register(Campaign)
admin.site.register(Committee, admin.ModelAdmin)
admin.site.register(ContactDetail, ContactDetailAdmin)
admin.site.register(Email, EmailAdmin)
admin.site.register(Entity, EntityAdmin)
admin.site.register(SenderQA)
