from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserRegisterForm
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.csrf import csrf_exempt
from . import functions
from . import models

import requests
import json
from django.http import JsonResponse

@csrf_exempt
def register(request):
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'

    #default to college station, and change cstat to college station for api call
    if(city == 'cstat' or city == ''): 
        city = 'College Station'
    city_weather = requests.get(url.format(city)).json() #request the API data and convert the JSON to Python data types
    weather = {
        'city' : city,
        'temperature' : city_weather['main']['temp'],
        'description' : city_weather['weather'][0]['description'],
        'icon' : city_weather['weather'][0]['icon']
    }
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account has been created for {username}!')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form, 'weather' : weather, 'show_back_button' : True})

class CustomLoginView(LoginView):
    def form_valid(self, form):
        response = super().form_valid(form)

        # Check user attributes and redirect accordingly
        if self.request.user.is_superuser:
            return redirect('Manager Home')
        elif self.request.user.is_staff:
            return redirect('Staff Home')
        else:
            return redirect('Customer Home')
        
        
@user_passes_test(lambda u: u.is_staff, login_url='login')
def register_staff(request):
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'

    if(city == 'cstat' or city == ''): 
        city = 'College Station'
    city_weather = requests.get(url.format(city)).json() #request the API data and convert the JSON to Python data types
    weather = {
        'city' : city,
        'temperature' : city_weather['main']['temp'],
        'description' : city_weather['weather'][0]['description'],
        'icon' : city_weather['weather'][0]['icon']
    }
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = True
            user.save()
            username = user.username
            messages.success(request, f'Account has been created for {username}!')
            return redirect('About')
    else:
        form = UserRegisterForm()

    return render(request, 'users/register_staff.html', {'form': form, 'weather' : weather, 'show_back_button' : True, 'is_main_page' : False, 'is_manager_home' : True})

@csrf_exempt
@user_passes_test(lambda u: u.is_superuser, login_url='login')
def register_manager(request):
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'

    #default to college station, and change cstat to college station for api call
    if(city == 'cstat' or city == ''): 
        city = 'College Station'
    city_weather = requests.get(url.format(city)).json() #request the API data and convert the JSON to Python data types
    weather = {
        'city' : city,
        'temperature' : city_weather['main']['temp'],
        'description' : city_weather['weather'][0]['description'],
        'icon' : city_weather['weather'][0]['icon']
    }
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = True
            user.is_manager = True
            user.save()
            username = user.username
            messages.success(request, f'Account has been created for {username}!')
            return redirect('About')
    else:
        form = UserRegisterForm()

    return render(request, 'users/register_manager.html', {'form': form, 'weather' : weather, 'show_back_button' : True, 'is_main_page' : False, 'is_manager_home' : True})

@user_passes_test(lambda u: u.is_superuser, login_url='login')
def users(request):
    users = list(functions.getUsers().values())[::-1]
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'

    #default to college station, and change cstat to college station for api call
    if(city == 'cstat' or city == ''): 
        city = 'College Station'
    city_weather = requests.get(url.format(city)).json() #request the API data and convert the JSON to Python data types
    weather = {
        'city' : city,
        'temperature' : city_weather['main']['temp'],
        'description' : city_weather['weather'][0]['description'],
        'icon' : city_weather['weather'][0]['icon']
    }
    
    context = {'users' : users,
               'user' : current_user,
               'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'users/users.html', context)

@csrf_exempt
@user_passes_test(lambda u: u.is_superuser, login_url='login')
def delete_user(request):
    data = json.loads(request.body.decode('utf-8'))

    deleted_user_id = data.get('deleted_user_id', -1)
    if deleted_user_id == -1:
        return JsonResponse({'message': 'User not found'}, status=404)
    
    user_id = data.get('user_id', -1)
    if user_id == 'None':
        return JsonResponse({'message': 'User not found'}, status=404)
    if not models.NewUser.objects.get(id=user_id).is_superuser:
        return JsonResponse({'message': 'User not admin'}, status=404)
    
    try:
        user_to_update = models.NewUser.objects.get(id=deleted_user_id)
        user_to_update.is_deleted = True
        user_to_update.save()
        return JsonResponse({'message': 'update success'})
    except models.NewUser.DoesNotExist:
        return JsonResponse({'message': 'Item not found'}, status=404)

@csrf_exempt
@user_passes_test(lambda u: u.is_superuser, login_url='login')
def edit_user(request, user_id):
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'

    #default to college station, and change cstat to college station for api call
    if(city == 'cstat' or city == ''): 
        city = 'College Station'
    city_weather = requests.get(url.format(city)).json() #request the API data and convert the JSON to Python data types
    weather = {
        'city' : city,
        'temperature' : city_weather['main']['temp'],
        'description' : city_weather['weather'][0]['description'],
        'icon' : city_weather['weather'][0]['icon']
    }
    user_o = models.NewUser.objects.get(id=user_id)
    context = {'edit_user' : user_o,
               'bday' : str(user_o.birthday),
               'user' : current_user,
               'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'users/edit_user.html', context)

@csrf_exempt
@user_passes_test(lambda u: u.is_superuser, login_url='login')
def submit_edit_user(request):
    data = json.loads(request.body.decode('utf-8'))

    edit_user_id = data.get('edit_user_id', -1)
    role = data.get('selected_role')
    if role not in ['manager', 'staff', 'admin', 'customer']:
        return JsonResponse({'message': 'Role not found'}, status=404)

    if edit_user_id == 'None' or edit_user_id == 'None':
        return JsonResponse({'message': 'User not found'}, status=404)
    
    user_id = data.get('user_id', -1)
    if user_id == 'None':
        return JsonResponse({'message': 'User not found'}, status=404)
    if not models.NewUser.objects.get(id=user_id).is_superuser:
        return JsonResponse({'message': 'User not admin'}, status=404)
    
    try:
        edit_user_id = data.get('edit_user_id')
        username = data.get('username')
        email = data.get('email')
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        birthday = data.get('birthday')
        phone = data.get('phone')
        store = data.get('store')


        # Retrieve the user to update
        user_to_update = models.NewUser.objects.get(id=edit_user_id)

        # Update user attributes if they are not None
        if username != 'None':
            if not len(list(models.NewUser.objects.all().filter(username=username))):
                user_to_update.username = username
        if email != 'None':
            user_to_update.email = email
        if firstname != 'None':
            user_to_update.firstname = firstname
        if lastname != 'None':
            user_to_update.lastname = lastname
        print(birthday)
        if birthday != 'None' and birthday != '':
            try:
                user_to_update.birthday = birthday
            except:
                print('Failed bday')
        if phone != 'None':
            user_to_update.phone = phone
        if store != 'None':
            user_to_update.store = store

        # Update user roles based on selected role if it is not 'None'
        if role != 'None':
            user_to_update.is_staff = role in ['manager', 'staff', 'admin']
            user_to_update.is_manager = role in ['manager', 'admin']
            user_to_update.is_superuser = role == 'admin'

        user_to_update.save()

        return JsonResponse({'message': 'update success'})
    except models.NewUser.DoesNotExist:
        return JsonResponse({'message': 'Item not found'}, status=404)

def admin_landing(request):
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'

    #default to college station, and change cstat to college station for api call
    if(city == 'cstat' or city == ''): 
        city = 'College Station'
    city_weather = requests.get(url.format(city)).json() #request the API data and convert the JSON to Python data types
    weather = {
        'city' : city,
        'temperature' : city_weather['main']['temp'],
        'description' : city_weather['weather'][0]['description'],
        'icon' : city_weather['weather'][0]['icon']
    }
    context = {'user' : current_user,
               'weather': weather, 'is_main_page' : True, 'is_main_page' : False, 'is_manager_home' : False}
    
    return render(request, 'users/admin_landing.html', context=context)