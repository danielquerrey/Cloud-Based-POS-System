# Generated by Django 4.2.6 on 2023-12-02 22:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0009_orders_is_favorite'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orders',
            name='is_favorite',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
