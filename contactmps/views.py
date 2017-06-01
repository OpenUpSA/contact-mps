from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404

from .models import (
    Email,
    Person,
)


def home(request):
    persons = Person.objects.all()
    return render(request, 'index.html', {
        'persons': persons,
    })


def email(request):
    if request.method == 'POST':
        person = Person.objects.get(id=request.POST['person'][0])
        if 'HTTP_X_FORWARDED_FOR' in request.META:
            remote_ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
        else:
            remote_ip = request.META.get('REMOTE_ADDR', '')
        email = Email(
            to_person=person,
            from_name=request.POST['from_name'],
            from_email=request.POST['from_email'],
            body=request.POST['body'],
            subject=request.POST['subject'],
            remote_ip=remote_ip,
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        email.save()
        email.send()
        return redirect(reverse('email-detail', kwargs={'uuid': email.uuid}))
    else:
        return redirect('/')


def email_detail(request, uuid):
    email = get_object_or_404(Email, uuid=uuid)
    return render(request, 'email-detail.html', {
        'email': email,
    })
