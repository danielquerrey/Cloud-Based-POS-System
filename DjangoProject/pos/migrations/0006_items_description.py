# Generated by Django 4.2.6 on 2023-11-27 23:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0005_alter_items_price_alter_orders_price_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='items',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
