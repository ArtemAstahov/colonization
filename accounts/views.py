from django.contrib import auth
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.http import HttpResponseRedirect
from django.shortcuts import render


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']
            new_user = authenticate(username=username, password=password)
            auth.login(request, new_user)
            return HttpResponseRedirect("/")
        else:
            errors = ["There is an error"]
            return render(request, 'game/register.html', {'form':  UserCreationForm(), 'errors': errors})
    else:
        return render(request, 'game/register.html', {'form':  UserCreationForm()})


def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            auth.login(request, form.get_user())
            return HttpResponseRedirect("/")
        else:
            errors = ["There is an error"]
            return render(request, 'game/login.html', {'form':  AuthenticationForm(), 'errors': errors})
    else:
        return render(request, 'game/login.html', {'form':  AuthenticationForm()})


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect("/")