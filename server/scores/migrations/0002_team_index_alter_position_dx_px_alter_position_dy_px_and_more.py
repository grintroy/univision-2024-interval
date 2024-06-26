# Generated by Django 5.0.3 on 2024-03-22 15:13

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scores", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="team",
            name="index",
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="position",
            name="dx_px",
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name="position",
            name="dy_px",
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name="position",
            name="rotate_deg",
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name="position",
            name="scale",
            field=models.FloatField(default=1),
        ),
    ]
