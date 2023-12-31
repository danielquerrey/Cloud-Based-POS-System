# Generated by Django 4.2.6 on 2023-10-31 02:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0002_alter_deliveries_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='deliveries',
            options={'ordering': ['id'], 'verbose_name_plural': 'Deliveries'},
        ),
        migrations.AlterModelOptions(
            name='ingredients',
            options={'ordering': ['id'], 'verbose_name_plural': 'Ingredients'},
        ),
        migrations.AlterModelOptions(
            name='items',
            options={'ordering': ['id'], 'verbose_name_plural': 'Items'},
        ),
        migrations.AlterModelOptions(
            name='orders',
            options={'ordering': ['id'], 'verbose_name_plural': 'Orders'},
        ),
        migrations.AlterModelOptions(
            name='restaurants',
            options={'verbose_name_plural': 'Restaurants'},
        ),
        migrations.AlterModelOptions(
            name='users',
            options={'ordering': ['id'], 'verbose_name_plural': 'Users'},
        ),
    ]
