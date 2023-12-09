#This page creates classes (models) for each database table, as well as the class fields (table fields)
from django.db import models

class Deliveries(models.Model):
    id = models.IntegerField(primary_key=True)
    delivery_date = models.DateTimeField(blank=True, null=True)
    delivered = models.BooleanField(blank=True, null=True)

    class Meta:
        db_table = 'deliveries'
        ordering = ['id']
        verbose_name_plural = "Deliveries"


class DeliveryItem(models.Model):
    delivery = models.ForeignKey(Deliveries, on_delete=models.CASCADE, blank=True, null=True)
    item_id = models.IntegerField(blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'delivery_item'


class IngredientItem(models.Model):
    id = models.IntegerField(primary_key=True)
    ingredient = models.ForeignKey('Ingredients', on_delete=models.CASCADE, blank=True, null=True)
    item = models.ForeignKey('Items', on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        db_table = 'ingredient_item'
        ordering = ['id']
        
    def get_next_highest_id():
        highest_id_item = IngredientItem.objects.order_by('-id').first()
        if highest_id_item:
            return highest_id_item.id + 1
        return 0


class Ingredients(models.Model):
    id = models.IntegerField(primary_key=True)
    common_name = models.TextField(blank=True, null=True)
    stock = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'ingredients'
        ordering = ['id']
        verbose_name_plural = "Ingredients"

    def __str__(self) :
        return self.common_name


class Items(models.Model):
    img_source = models.URLField(blank=True, null=True)
    id = models.IntegerField(primary_key=True)
    item_name = models.TextField(blank=True, null=True)
    common_name = models.TextField(blank=True, null=True)
    stock = models.IntegerField(blank=True, null=True)
    price = models.DecimalField(max_digits=1000, decimal_places=2, blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)


    class Meta:
        db_table = 'items'
        ordering = ['id']
        verbose_name_plural = "Items"

    def __str__(self):
        return self.common_name
    
    def get_next_highest_id():
        highest_id_item = Items.objects.order_by('-id').first()
        if highest_id_item:
            return highest_id_item.id + 1
        return 0

    def get_highest_id():
        highest_id_item = Items.objects.order_by('-id').first()
        if highest_id_item:
            return highest_id_item.id
        return 0


class OrderItem(models.Model):
    order = models.ForeignKey('Orders', on_delete=models.CASCADE, blank=True, null=True)
    item = models.ForeignKey(Items, on_delete=models.CASCADE, blank=True, null=True)
    id = models.IntegerField(primary_key=True)

    class Meta:
        db_table = 'order_item'
        ordering = ['id']
    
    def get_next_highest_id():
        highest_id_item = OrderItem.objects.order_by('-id').first()
        if highest_id_item:
            return highest_id_item.id + 1
        return 0



class Orders(models.Model):
    id = models.IntegerField(primary_key=True)
    price = models.DecimalField(max_digits=1000, decimal_places=2, blank=True, null=True)
    paid = models.BooleanField(blank=True, null=True)
    delivered = models.BooleanField(blank=True, null=True)
    date_time = models.DateTimeField(blank=True, null=True)
    is_favorite = models.BooleanField(default=False, null=True, blank=True)
    user = models.ForeignKey('users.NewUser', on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        db_table = 'orders'
        ordering = ['id']
        verbose_name_plural = "Orders"
    
    def get_next_highest_id():
        highest_id_item = Orders.objects.order_by('-id').first()
        if highest_id_item:
            return highest_id_item.id + 1
        return 0

    def __str__(self):
        # format specification
        format = '%m/%d/%Y %H:%M:%S'

        # applying strftime() to format the datetime
        date_string = self.date_time.strftime(format)

        return date_string


class Restaurants(models.Model):
    restaurant_name = models.TextField(primary_key=True)
    occupancy = models.IntegerField(blank=True, null=True)
    restaurant_location = models.TextField(blank=True, null=True)
    restaurant_type = models.TextField(blank=True, null=True)
    revenue = models.DecimalField(max_digits=1000, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'restaurants'
        verbose_name_plural = "Restaurants"

    def __str__(self):
        return self.restaurant_name


class Users(models.Model):
    id = models.IntegerField(primary_key=True)
    user_name = models.TextField(blank=True, null=True)
    position = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'users'
        ordering = ['id']
        verbose_name_plural = "Users"

    def __str__(self):
        return self.user_name
    
    @staticmethod
    def get_next_highest_id():
        highest_id_item = Users.objects.order_by('-id').first()
        if highest_id_item:
            return highest_id_item.id + 1
        return 0
