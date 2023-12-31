# Generated by Django 4.2.6 on 2023-10-25 15:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Deliveries',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('delivery_date', models.DateTimeField(blank=True, null=True)),
                ('delivered', models.BooleanField(blank=True, null=True)),
            ],
            options={
                'db_table': 'deliveries',
            },
        ),
        migrations.CreateModel(
            name='Ingredients',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('common_name', models.TextField(blank=True, null=True)),
                ('stock', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'db_table': 'ingredients',
            },
        ),
        migrations.CreateModel(
            name='Items',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('item_name', models.TextField(blank=True, null=True)),
                ('common_name', models.TextField(blank=True, null=True)),
                ('stock', models.IntegerField(blank=True, null=True)),
                ('price', models.DecimalField(blank=True, decimal_places=65535, max_digits=65535, null=True)),
                ('category', models.TextField(blank=True, null=True)),
            ],
            options={
                'db_table': 'items',
            },
        ),
        migrations.CreateModel(
            name='Restaurants',
            fields=[
                ('restaurant_name', models.TextField(primary_key=True, serialize=False)),
                ('occupancy', models.IntegerField(blank=True, null=True)),
                ('restaurant_location', models.TextField(blank=True, null=True)),
                ('restaurant_type', models.TextField(blank=True, null=True)),
                ('revenue', models.DecimalField(blank=True, decimal_places=65535, max_digits=65535, null=True)),
            ],
            options={
                'db_table': 'restaurants',
            },
        ),
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('user_name', models.TextField(blank=True, null=True)),
                ('position', models.TextField(blank=True, null=True)),
            ],
            options={
                'db_table': 'users',
            },
        ),
        migrations.CreateModel(
            name='Orders',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('price', models.DecimalField(blank=True, decimal_places=65535, max_digits=65535, null=True)),
                ('paid', models.BooleanField(blank=True, null=True)),
                ('delivered', models.BooleanField(blank=True, null=True)),
                ('date_time', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='pos.users')),
            ],
            options={
                'db_table': 'orders',
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('item', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='pos.items')),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='pos.orders')),
            ],
            options={
                'db_table': 'order_item',
            },
        ),
        migrations.CreateModel(
            name='IngredientItem',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('ingredient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='pos.ingredients')),
                ('item', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='pos.items')),
            ],
            options={
                'db_table': 'ingredient_item',
            },
        ),
        migrations.CreateModel(
            name='DeliveryItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_id', models.IntegerField(blank=True, null=True)),
                ('quantity', models.IntegerField(blank=True, null=True)),
                ('delivery', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='pos.deliveries')),
            ],
            options={
                'db_table': 'delivery_item',
            },
        ),
    ]
