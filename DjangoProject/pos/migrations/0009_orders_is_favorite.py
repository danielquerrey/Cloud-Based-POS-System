# Generated by Django 4.2.6 on 2023-12-02 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0008_alter_ingredients_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='orders',
            name='is_favorite',
            field=models.BooleanField(default=False),
        ),
    ]