from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Max
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

import json
import requests

from . import functions
from .models import Orders
from .models import OrderItem
from .models import Items
from .models import Ingredients
from .models import IngredientItem
from users.models import NewUser
from datetime import datetime

def base(request):
    current_user = request.user
    items = functions.getItems()
     
    context = {'items' : items, 
               'user' : current_user
               }
    return render(request, 'pos/base.html', context = context)

def index(request):
    context = {'items': functions.getItems()}
    return render(request, 'pos/index.html', context=context)

def cashier(request):
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
    items = functions.getItems()
    referer_url = request.META.get('HTTP_REFERER', '/')

    context = {'items': items, 'user': current_user, 'show_back_button' : True, 'referer_url': referer_url, 'weather' : weather}
    return render(request, 'pos/cashier.html', context=context)

def customer_landing(request):
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
    
    return render(request, 'pos/Customer_Interface/landing.html', context=context)

def staff_home(request):
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
               'weather' : weather}
    return render(request, 'pos/staff_landing.html', context=context)

def menu_loc(request):
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

    items = functions.getItems()
    context = {'items' : items, 
               'user' : current_user,
               'weather' : weather, 'is_main_page' : True
               }
    return render(request, 'pos/Menu_Loc/menu_loc.html', context = context)

@csrf_exempt
def place_order(request):
    if request.method == 'POST':
        try:
            # load our data from the client
            data = json.loads(request.body.decode('utf-8'))
            # create a new order and save it with this data
            delivered_bool = not data.get('mobile')
            new_order = Orders(id=Orders.get_next_highest_id(), price=round(data.get('price'),2),
                               date_time=datetime.now(), user=NewUser.objects.get(id=data.get('user_id')), 
                               delivered=delivered_bool, paid=True)
            new_order.save()
            print(new_order.delivered)
            # create associated order_items
            for item_id in data.get('item_ids'):
                item, created = Items.objects.get_or_create(id=item_id)
                new_order_item = OrderItem(id=OrderItem.get_next_highest_id(), item=item, order=new_order)
                if created:
                    item.save()
                new_order_item.save()
                ingredients = IngredientItem.objects.filter(item = item_id)
                for i in ingredients:
                    ingredient = Ingredients.objects.get(id = i.ingredient.id)
                    ingredient.stock = ingredient.stock - 1
                    ingredient.save()
                    
                    
            
            return JsonResponse({'message': 'Data received and processed.'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    
@csrf_exempt
def delete_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            if(data.get('user_id') == 'None' or data.get('order_id') == 'None'):
                return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
            
            # Delete related OrderItem objects
            try:
                Orders.objects.filter(id=data.get('order_id')).delete()
                OrderItem.objects.filter(order_id=data.get('order_id')).delete()
            except:
                print("Excepting in deleting orders, failed")
            
            return JsonResponse({'message': 'Data received and processed.'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

def account_details(request):
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
    orders = functions.getUserOrders(user_id=current_user.id).values()
    items = functions.getItems()
    context = {'user' : current_user, 'orders' : orders, 'items' : items, 'weather' : weather}
    return render(request, 'pos/Account_Details/account_details.html', context=context)

@csrf_exempt
def update_info(request) :
    if request.method == 'POST':
        try:
            # load our data from the client
            data = json.loads(request.body.decode('utf-8'))
            
            # update the user's birthday
            user = NewUser.objects.get(id=data.get('user_id'))

            if ('birthday' in data):
                user.birthday = data.get('birthday')
            elif ('card' in data):
                user.card = data.get('card')
            elif ('phone' in data):
                user.phone = data.get('phone')
            elif ('password' in data):
                user.set_password(data.get('password'))
            elif ('store' in data):
                user.store = data.get('store')
            elif ('email' in data):
                try:
                    validate_email(data.get('email'))
                except ValidationError:
                    return JsonResponse({'error': 'Invalid email.'}, status=400)
                
                user.email = data.get('email')
            
            user.save()
            
            return JsonResponse({'message': 'Data received and processed.'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def update_favorite(request):
    if request.method == 'POST':
        try:
            # load our data from the client
            data = json.loads(request.body.decode('utf-8'))
            orders = functions.getOrder(data.get('order_id'))
            print("BEFORE: " + str(orders.is_favorite))
            if data.get('favorite') == 'true':
                orders.is_favorite = True
            else:
                orders.is_favorite = False
            print("AFTER: " + str(orders.is_favorite))
            orders.save()
            
            return JsonResponse({'message': 'Data received and processed.'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

def manager_home(request):
    items = functions.getItems()
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
    referer_url = request.META.get('HTTP_REFERER', '/')
    context = {'items': items, 'show_back_button' : True, 'referer_url': referer_url, 'weather' : weather, 'is_main_page' : False, 'is_manager_home' : False}
    return render(request, 'pos/Manager/manager_home.html', context)

def sales_analysis(request):
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
    items = functions.getItems()
    context = {'items': items,
               'weather': weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'pos/Manager/sales_report.html', context)

@csrf_exempt
def new_excess_time(request):
    if request.method == 'POST':
        # load our data from the client
        data = json.loads(request.body.decode('utf-8'))
        excess_report = functions.get_excess_alerts(data.get('start-date'),data.get('end-date'))
        return JsonResponse({'excess_report': excess_report})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

def alerts(request):
    restock_report = functions.get_restock_alerts()
    excess_report = functions.get_excess_alerts('2023-11-01','2023-11-10')
    commonly_sold_together = functions.get_top_common_items()
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

    context = {'restock_report': restock_report,
               'excess_report': excess_report,
               'common_pairs' : commonly_sold_together,
               'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'pos/Manager/alerts.html', context)

def get_sales_graph(request):
    item_id = request.GET.get('item_id', 0)
    graph = functions.salesGraph(item_id).to_html(full_html=False)
    return JsonResponse({'graph_html': graph})

def get_stock_graph(request):
    item_id = request.GET.get('item_id', 0)
    graph = functions.stockGraph(item_id).to_html(full_html=False)
    return JsonResponse({'graph_html': graph})

def ingredients(request):
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
    ingredients = functions.getIngredients()
    context = {'ingredients': ingredients,
               'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'pos/Manager/ingredients.html', context)

def update_items(request):
    items = functions.getItems()
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
    context = {'items': items,
               'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'pos/Manager/update_items.html', context)


def about(request):
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
    context = {'weather' : weather, 'is_main_page' : True}
    return render(request, 'pos/About/about.html', context)


def order_online(request) :
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
    items = functions.getItems()
    referer_url = request.META.get('HTTP_REFERER', '/')

    context = {'items' : items, 
               'user' : current_user, 
               'show_back_button' : True, 
               'referer_url': referer_url,
               'weather' : weather}
    return render(request, 'pos/Order_Online/order_online.html', context = context)

def ajax_delete(request):
    item_id = request.GET.get('item_id', 0)
    
    try:
        item_to_update = Items.objects.get(id=item_id)
        item_to_update.category = 'old'
        item_to_update.save()
        return JsonResponse({'message': 'update success'})
    except Items.DoesNotExist:
        return JsonResponse({'message': 'Item not found'}, status=404)

def checkout_order(request) :
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=imperial&appid=d6902351c4c813d7687de6f956e67321'
    current_user = request.user
    if(request.user.is_authenticated):
        city = current_user.store
    else:
        city = 'College Station'
    items = functions.getItems()
    referer_url = request.META.get('HTTP_REFERER', '/')

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

    context = {'items' : items, 
                'current_id' : Orders.get_next_highest_id(),
               'user' : current_user, 
               'show_back_button' : True, 
               'referer_url': referer_url,
               'weather' : weather, 'is_main_page' : False}
    return render(request, 'pos/Order_Online/checkout_order.html', context = context)

def order_history(request):
    orders = list(functions.getOrders().values())[::-1]
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
    
    context = {'orders' : orders,
               'user' : current_user,
               'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'pos/Manager/order_history.html', context)



@csrf_exempt
def new_order_history(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        orders = list(functions.getOrders(int(data.get('go_to_id'))).values())[::-1]
        context = {'orders' : list(orders)}
        return JsonResponse(context)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    
def edit_order_view(request, order_id):
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
    # Retrieve the order with the given ID, perform any necessary actions, and render the page
    current_user = request.user
    order = functions.getOrder(order_id)
    related_objects = OrderItem.objects.filter(order_id=order.id)
    items = functions.getItems()
    quantities = {}
    context = {'items': items, 'user': current_user, 'order_items': [], 'order':order, 'weather' : weather}
    for oi in related_objects:
        if oi.item.id not in quantities.keys():
            context['order_items'].append({"common_name":oi.item.common_name, "id":oi.item.id, "price": float(oi.item.price), "item_price": float(oi.item.price)})
            quantities[oi.item.id] = 1
        else:
            quantities[oi.item.id] = quantities[oi.item.id] + 1
            context['order_items'][-1]['price'] = round(context['order_items'][-1]['price'] + float(oi.item.price),2)
    for oi in context['order_items']:
        oi['quantity'] = quantities[oi["id"]]
    
    # Convert order_items to JSON
    order_items_json = json.dumps(context['order_items'])
    context["order_items_json"] = order_items_json
    
    # Update the quantities dictionary
    return render(request, 'pos/Manager/edit_order.html', context=context)

def create_item(request):
    ingredients = functions.getIngredients()
    categories = ["Piadas", "Salads","Pastas", "Sides", "Drinks", "Kids", "Create", "Seasonal"]
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
    context = {'ingredients': ingredients, "categories":categories, 'weather' : weather, 'is_main_page' : False, 'is_manager_home' : True}
    return render(request, 'pos/Manager/create_item.html', context)

def edit_item(request, item_id):
    ingredients = [{"common_name":i.common_name,"id":i.id}for i in functions.getIngredients()]
    item_ingredients = functions.getIngredientItems(item_id)
    item = functions.getItem(item_id)
    categories = ["Piadas", "Salads","Pastas", "Sides", "Drinks", "Kids", "Create", "Seasonal"]
    context = {'ingredients': ingredients, "categories":categories, 'item':item, 'is_main_page' : False, 'is_manager_home' : True}

    included_ingredients = set()
    for ii in item_ingredients:
        try:
            included_ingredients.add(ii.ingredient.common_name)
        except:
            continue
    for i in ingredients:
        if i['common_name'] in included_ingredients:
            i['is_in'] = True

    return render(request, 'pos/Manager/edit_item.html', context)

@csrf_exempt
def save_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            if(data.get('user_id') == 'None' or data.get('order_id') == 'None' or data.get('price') == 'None' or data.get('item_ids') == 'None'):
                return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
            
            # Delete related OrderItem objects
            try:
                OrderItem.objects.filter(order_id=data.get('order_id')).delete()
            except:
                print("No Items")
            
            dt = functions.getOrder(data.get('order_id')).date_time
            # Delete orders
            # Orders(data.get('order_id')).delete()
                        # load our data from the client
            # create a new order and save it with this data
            new_order = Orders(id=data.get('order_id'), price=round(data.get('price'),2),
                               paid=True, delivered=True, date_time=dt, 
                               user=NewUser.objects.get(id=data.get('user_id')))
            new_order.save()

            # create associated order_items
            for item_id in data.get('item_ids'):
                if item_id == None:
                    break
                item, created = Items.objects.get_or_create(id=item_id)
                new_order_item = OrderItem(id=OrderItem.get_next_highest_id(), item=item, order=new_order)
                if created:
                    item.save()
                new_order_item.save()
            
            return JsonResponse({'message': 'Data received and processed.'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def create_item_submit(request):
    if request.method == 'POST':
        try:

            # load our data from the client
            data = json.loads(request.body.decode('utf-8'))
            id = data.get('id')
            if id == -1:
                id = Items.get_next_highest_id()
            else:
                # Delete related OrderItem objects
                IngredientItem.objects.filter(item_id=id).delete()

                # Delete orders
                Items.objects.filter(id=id).delete()

            # create a new order and save it with this data
            print(id)
            new_item = Items(id=id, item_name = data.get('name'), common_name = data.get('name'), stock = 0, 
                             price = data.get('price'), category=data.get('category').lower(), description=data.get('description'))
            new_item.save()
            # create associated order_items
            for ingredient_id in data.get('ingredient_ids'):
                new_ingredient_item = IngredientItem(id=IngredientItem.get_next_highest_id(), ingredient=Ingredients(ingredient_id), item=new_item)
                new_ingredient_item.save()
            
            return JsonResponse({'message': 'Data received and processed.'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def update_stock(request):
    if request.method == 'POST':
        item_id = request.POST.get('item_id')
        new_stock = request.POST.get('new_stock')

        # Perform the update in the database
        ingredient = Ingredients.objects.get(id=item_id)
        ingredient.stock = new_stock
        ingredient.save()

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error'})

@csrf_exempt
def delete_ingredient(request):
    if request.method == 'POST':
        item_id = request.POST.get('item_id')

        # Perform the delete operation in the database
        ingredient = Ingredients.objects.get(id=item_id)
        ingredient.delete()

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error'})

@csrf_exempt
def add_new_ingredient(request):
    if request.method == 'POST':
        ingredient_name = request.POST.get('ingredient_name')
        initial_stock = request.POST.get('initial_stock')

        # Retrieve the maximum current ID from the database
        max_id = Ingredients.objects.aggregate(Max('id'))['id__max']

        # Calculate the next available ID
        next_id = max_id + 1 if max_id is not None else 1

        # Perform the addition of the new ingredient with the manually assigned ID
        new_ingredient = Ingredients(id=next_id, common_name=ingredient_name, stock=initial_stock)
        new_ingredient.save()

        return JsonResponse({'status': 'success', 'new_ingredient_id': next_id})

    return JsonResponse({'status': 'error'})

def kitchen(request):
    current_user = request.user
    orders = functions.getMobileOrders().values()
    context = {'user' : current_user, 'orders' : orders}
    return render(request, 'pos/kitchen.html', context=context)

@csrf_exempt
def kitchen_deliver(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        order_id = data.get('order_id')
        
        order, created = Orders.objects.get_or_create(id=order_id)

        if created:
            print("ERROR DELIVERING")
        
        order.delivered = True

        order.save()

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error'})

@csrf_exempt
def new_kitchen(request):
    if request.method == 'POST':
        orders = functions.getMobileOrders().values()
        now = datetime.now()
        context = {'orders' : list(orders), 'now':now}
        return JsonResponse(context)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
