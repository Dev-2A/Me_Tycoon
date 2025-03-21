from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]
    
    operations = [
        migrations.AddField(
            model_name='user',
            name='background',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='profile_frame',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='special_icon',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]