# Generated by Django 4.2.6 on 2023-12-02 04:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0007_alter_ingredients_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredients',
            name='id',
            field=models.IntegerField(primary_key=True, serialize=False),
        ),
    ]