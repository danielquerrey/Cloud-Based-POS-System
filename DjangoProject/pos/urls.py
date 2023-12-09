from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

#import views file from . (current directory)
from . import views

urlpatterns = [
    #https://sitename.com/'' will link to the index view
    path('', views.about, name="About"),
    path('cashier/', views.cashier, name="cashier"),
    path('staff/', views.staff_home, name = "Staff Home"),
    path('customer/', views.customer_landing, name = "Customer Home"),
    path('place_order/', views.place_order, name = "Place Order"),
    path('save_order/', views.save_order, name = "Save Order"),
    path('manager/', views.manager_home, name='Manager Home'),
    path('menu_location/', views.menu_loc, name = "Menu Location"),
    path('account_details/', views.account_details, name = "Account Details"),
    path('update_info/', views.update_info, name = "Update Info"),
    path('sales_analysis/', views.sales_analysis, name = "Sales Analysis"), 
    path('get_sales_graph/', views.get_sales_graph, name='get_sales_graph'),
    path('get_stock_graph/', views.get_stock_graph, name='get_stock_graph'),
    path('alerts/', views.alerts, name='alerts'),
    path('ingredients/', views.ingredients, name='ingredients'),
    path('update_items/', views.update_items, name='update items'),
    path('new_excess_time/', views.new_excess_time, name='New Excess Time'),
    path('order_online/', views.order_online, name='Order Online'),
    path('ajax_delete/', views.ajax_delete, name='Ajax Delete'),
    path('update_stock/', views.update_stock, name="Update Stock"),
    path('add_new_ingredient/', views.add_new_ingredient, name="Add Ingredient"),
    path('delete_ingredient/', views.delete_ingredient, name="Delete Ingredient"),
    path('checkout_order/', views.checkout_order, name='Check Out Order'),
    path('order_history/', views.order_history, name='Order History'),
    path('new_order_history/', views.new_order_history, name='new_order_history'),
    path('new_excess_time/', views.new_excess_time, name='New Excess Time'),
    path('edit_order/<int:order_id>/', views.edit_order_view, name='edit_order'),
    path('edit_item/<int:item_id>/', views.edit_item, name='edit_item'),
    path('create_item/', views.create_item, name='create_item'),
    path('create_item_submit/', views.create_item_submit, name='create_item_submit'),
    path('update_favorite/', views.update_favorite, name = "Update Favorite"),
    path('delete_order/', views.delete_order, name = "delete_order"),
    path('kitchen/', views.kitchen, name = "Kitchen"),
    path('kitchen_deliver/', views.kitchen_deliver, name = "kitchen_deliver"),
    path('new_kitchen/', views.new_kitchen, name = "new_kitchen"),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)