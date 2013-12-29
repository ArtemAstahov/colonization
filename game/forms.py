from django import forms


class RegisterForm(forms.Form):
    username = forms.CharField()
    email = forms.EmailField()


class LoginForm(forms.Form):
    username = forms.TextInput()
    password = forms.PasswordInput()
