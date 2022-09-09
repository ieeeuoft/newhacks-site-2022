# Generated by Django 3.2.14 on 2022-09-09 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0006_remove_application_rsvp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='what_past_experience',
            field=models.TextField(help_text='If you’ve been to a hackathon, briefly tell us your experience. If not, describe what you expect to see and experience.', max_length=1000),
        ),
        migrations.AlterField(
            model_name='application',
            name='what_technical_experience',
            field=models.TextField(help_text='What is your technical experience with software?', max_length=1000),
        ),
        migrations.AlterField(
            model_name='application',
            name='why_participate',
            field=models.TextField(help_text='Why do you want to participate in NewHacks?', max_length=1000),
        ),
    ]
