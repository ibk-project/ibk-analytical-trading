# Generated by Django 4.0.5 on 2022-07-12 07:31

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Commodity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
                ('code', models.CharField(max_length=10)),
                ('date', models.CharField(max_length=12)),
                ('open', models.FloatField(max_length=10)),
                ('close', models.FloatField(max_length=10)),
                ('high', models.FloatField(max_length=10)),
                ('low', models.FloatField(max_length=10)),
                ('change', models.FloatField(max_length=10)),
                ('volume', models.FloatField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Index',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
                ('code', models.CharField(max_length=10)),
                ('date', models.CharField(max_length=12)),
                ('open', models.FloatField(max_length=10)),
                ('close', models.FloatField(max_length=10)),
                ('high', models.FloatField(max_length=10)),
                ('low', models.FloatField(max_length=10)),
                ('change', models.FloatField(max_length=10)),
                ('volume', models.FloatField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
                ('code', models.CharField(max_length=10)),
                ('date', models.CharField(max_length=12)),
                ('open', models.FloatField(max_length=10)),
                ('close', models.FloatField(max_length=10)),
                ('high', models.FloatField(max_length=10)),
                ('low', models.FloatField(max_length=10)),
                ('change', models.FloatField(max_length=10)),
                ('volume', models.FloatField(max_length=10)),
            ],
        ),
    ]
