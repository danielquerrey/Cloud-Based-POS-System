# Generated by Django 4.2.6 on 2023-12-02 04:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0006_items_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredients',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
