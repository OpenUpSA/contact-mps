import xlwt
import datetime

from django.http import HttpResponse
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

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


class SenderQAQuestionFilter(admin.SimpleListFilter):
    title = _('Question')
    parameter_name = 'question'

    def lookups(self, request, model_admin):
        return (
            ('make_contact', _('Can be Contacted')),
        )

    def queryset(self, request, queryset):
        if self.value() == 'make_contact':
            return queryset.filter(answer='Yes',
                                   question='Are you willing to be contacted by a journalist to elaborate on your answers?')


class SenderQAAdmin(admin.ModelAdmin):
    readonly_fields = ['question', 'question']
    list_filter = ('email__campaign',
                   'email__moderation_passed',
                   SenderQAQuestionFilter)
    list_display = ('from_email', 'from_name', 'question', 'answer')
    list_select_related = ('email', )
    actions = ['export_as_excel']

    def from_email(self, obj):
        return obj.email.from_email

    def from_name(self, obj):
        return obj.email.from_name

    def export_as_excel(self, request, queryset):
        field_names = ['Email', 'Name', 'Question', 'Answer']
        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = 'attachment; filename="emails.xls"'
        work_book = xlwt.Workbook(encoding='utf-8')
        work_sheet = work_book.add_sheet("Extra Submission Answers")
        row_num = 0
        for col_num in range(len(field_names)):
            work_sheet.write(row_num, col_num, field_names[col_num])

        for obj in queryset.select_related('email'):
            row_num += 1
            work_sheet.write(row_num, 0, obj.email.from_email)
            work_sheet.write(row_num, 1, obj.email.from_name)
            work_sheet.write(row_num, 2, obj.question)
            work_sheet.write(row_num, 3, obj.answer)
        work_book.save(response)
        return response

    export_as_excel.short_description = 'Export as Excel'


class EmailAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('subject', 'body_txt', 'is_moderated',
                       'moderation_passed')
        }),
        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('to_entity', 'to_addresses', 'remote_ip',
                       'user_agent', 'from_name', 'from_email',
                       'created_at', 'updated_at', 'secure_id',
                       'sender_secret', 'any_data', 'campaign',
                       'is_sent')
        })
    )
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
admin.site.register(SenderQA, SenderQAAdmin)
