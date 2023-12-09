from . import models
from datetime import datetime, timedelta
from django.db import connection
from django.db.models import Sum, Count, ExpressionWrapper, Count, F, ExpressionWrapper, DecimalField, Case, When, Prefetch, Count
from django.db.models.functions import TruncDate
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from itertools import combinations
from collections import Counter
 

def getItems():
    return models.Items.objects.all()

def getIngredients():
    return models.Ingredients.objects.all()

def getIngredientItems(item_id):
    return models.IngredientItem.objects.filter(item_id=item_id)

def getUserOrders(user_id):
    orders = {order['id']: order for order in models.Orders.objects.values().filter(user_id=user_id).reverse()[:6]}
    order_items = models.OrderItem.objects.filter(order_id__in=orders.keys()).values('order_id','item__common_name', 'item__id')
    items = models.Items.objects.filter(id__in=[order_item['item__id'] for order_item in order_items]).values('id', 'common_name', 'price')

    for order_item in order_items:
        orders[order_item['order_id']]['order_items'] = orders[order_item['order_id']].get('order_items', []) + [items.get(id=order_item['item__id'])]

    return orders

def getMobileOrders():
    bool_false = False
    orders = {order['id']: order for order in models.Orders.objects.values().filter(delivered=bool_false).reverse()[:1000]}
    order_items = models.OrderItem.objects.filter(order_id__in=orders.keys()).values('order_id','item__common_name', 'item__id')
    items = models.Items.objects.filter(id__in=[order_item['item__id'] for order_item in order_items]).values('id', 'common_name', 'price')

    for order_item in order_items:
        orders[order_item['order_id']]['order_items'] = orders[order_item['order_id']].get('order_items', []) + [items.get(id=order_item['item__id'])]

    return orders

def getOrders(start=models.Orders.get_next_highest_id()):
    default = models.Orders.get_next_highest_id()
    if(start > default):
        start = default
    orders = {order['id']: order for order in models.Orders.objects.values().filter(id__range=(start-99, start+2))}
    order_items = models.OrderItem.objects.filter(order_id__in=orders.keys()).values('order_id','item__common_name')

    for order_item in order_items:
        orders[order_item['order_id']]['common_names'] = orders[order_item['order_id']].get('common_names', []) + [order_item['item__common_name']]

    return orders

def getOrder(id_num):
    try:
        # Use the get method to retrieve a single object by its id
        object_instance = models.Orders.objects.get(id=id_num)
        return object_instance
    except models.Orders.DoesNotExist:
        # Handle the case where the object with the given id does not exist
        return None
def getItem(id_num):
    try:
        # Use the get method to retrieve a single object by its id
        object_instance = models.Items.objects.get(id=id_num)
        return object_instance
    except models.Items.DoesNotExist:
        # Handle the case where the object with the given id does not exist
        return None


def getOrderItems(orders):
    order_items = {}
    order_items['orders'] = []
    for order in orders :
        order_items['orders'].append(models.OrderItem.objects.filter(order=order['id']).values())
        order['common_names'] = [order['item__common_name'] for order in list(models.OrderItem.objects.filter(order=order['id']).values('item__common_name'))]

    return order_items

def salesGraph(item_id = 0):
    item_name = models.Items.objects.get(id=item_id).common_name

    # Get the sales history for the given item_id
    sales_per_day = models.OrderItem.objects.filter(item_id=item_id, order__delivered=True)\
        .annotate(date=TruncDate('order__date_time'))\
        .values('date')\
        .annotate(total_sales=Sum('item__price'))\
        .order_by('date')

    # Extract the data for plotting
    dates = [entry['date'] for entry in sales_per_day]
    total_sales = [entry['total_sales'] or 0 for entry in sales_per_day]

    # Pass the data to your template or use it in your graph plotting logic
    
    df = pd.DataFrame(
        {
        'dates' : dates,
        'sales' : total_sales
        }
    )
    fig = px.line(df, 
                  x='dates', 
                  y='sales', 
                  labels={
                     "dates": "Days",
                     "sales": "Sales ($)",
                  },
                  title='Sales of '+ item_name +' per day',
                  )
    fig.update_layout(
    title={
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'})
    return fig

def stockGraph(ingredient_id = 0):
    cingredient = models.Ingredients.objects.get(id=ingredient_id)
    item_name = cingredient.common_name
    item_stock = cingredient.stock

    sales_per_day = models.IngredientItem.objects.filter(
    ingredient_id=ingredient_id
    ).values(
        'item__orderitem__order__date_time__date'  # Truncate the date to ignore the time part
    ).annotate(
        total_sales=Count('item__orderitem'),
    ).annotate(
        date=TruncDate('item__orderitem__order__date_time')  # Annotate with the truncated date for clarity
    ).values(
        'date',
        'total_sales'
    ).order_by('date')

    # Extract the data for plotting
    dates = [entry['date'] for entry in sales_per_day]
    total_usage = [entry['total_sales'] or 0 for entry in sales_per_day]
        

    # Pass the data to your template or use it in your graph plotting logic
    
    df = pd.DataFrame(
        {
        'dates' : dates,
        'usage' : total_usage
        }
    )
    fig = px.line(df, 
                  x='dates', 
                  y='usage', 
                  labels={
                     "dates": "Days",
                     "usage": "Ingredient Usage",
                  },
                  title='Usage of '+ item_name +' per day',
                  )
    fig.update_layout(
    title={
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'})
    return fig

def get_restock_alerts():
    # get ingredients with stock < 100
    queryset = models.Ingredients.objects.filter(
    stock__lte=20,
    ).values(
        'id',
        'common_name',
        'stock'
    )
    return queryset

def get_excess_alerts(time, endTime):
    # get ingredients amount sold and old total inventory from db
    queryset = models.Ingredients.objects.filter(
    ingredientitem__item__orderitem__order__date_time__gte=time,
    ingredientitem__item__orderitem__order__date_time__lt=endTime
    ).values(
        'id',
        'common_name'
    ).annotate(
        amount_sold=Count(Case(When(ingredientitem__item__orderitem__order__date_time__gte=time, ingredientitem__item__orderitem__order__date_time__lt=endTime, then=1))),
        total_inventory=ExpressionWrapper(
            Count(Case(When(ingredientitem__item__orderitem__order__date_time__gte=time, ingredientitem__item__orderitem__order__date_time__lt=endTime, then=1))),
            output_field=DecimalField()
        ) + F('stock')
    ).order_by('amount_sold')

    # filter items not selling 10%
    # I know i am bad i couldnt get this to work with a query set it kept breaking and i dont know why - Ethan
    result_list = list(queryset.values())
    return_list = []
    for entry in result_list:
        if entry['amount_sold'] < .25 * float(entry['total_inventory']):
            return_list += [entry]

    return return_list

def get_top_common_items():
    num_pairs = 5;
    ret = []
    try:
        query = """
            SELECT
                I1.common_name AS Item1,
                I2.common_name AS Item2,
                COUNT(*) AS Occurrence
            FROM
                order_item A
            JOIN
                order_item B
            ON
                A.order_id = B.order_id
                AND A.item_id < B.item_id
            JOIN
                items I1
            ON
                A.item_id = I1.id
            JOIN
                items I2
            ON
                B.item_id = I2.id
            WHERE
                I1.id < 41
                AND I2.id < 41
            GROUP BY
                Item1, Item2
            ORDER BY
                Occurrence DESC
        """

        with connection.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()

        for i in range(num_pairs):
            if i < len(results):
                ret.append(f"{results[i][0]}, {results[i][1]}, occurs {results[i][2]} times")
            else:
                break

        return ret

    except Exception as e:
        print(e)
        return ret
