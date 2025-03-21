from django.db import migrations, models

def update_reward_types(apps, schema_editor):
    Reward = apps.get_model('rewards', 'Reward')
    
    # 배경화면 보상 업데이트
    space_backgrounds = Reward.objects.filter(name__contains='우주')
    for reward in space_backgrounds:
        reward.reward_type = 'background'
        reward.reward_value = 'space'
        reward.save()
    
    ocean_backgrounds = Reward.objects.filter(name__contains='바다')
    for reward in ocean_backgrounds:
        reward.reward_type = 'background'
        reward.reward_value = 'ocean'
        reward.save()
    
    jungle_backgrounds = Reward.objects.filter(name__contains='정글')
    for reward in jungle_backgrounds:
        reward.reward_type = 'background'
        reward.reward_value = 'jungle'
        reward.save()
    
    # 프로필 프레임 보상 업데이트
    gold_frames = Reward.objects.filter(name__contains='골드')
    for reward in gold_frames:
        reward.reward_type = 'profile_frame'
        reward.reward_value = 'gold'
        reward.save()
    
    diamond_frames = Reward.objects.filter(name__contains='다이아몬드')
    for reward in diamond_frames:
        reward.reward_type = 'profile_frame'
        reward.reward_value = 'diamond'
        reward.save()
        
    # 특수 아이콘 보상 업데이트
    crown_icons = Reward.objects.filter(name__contains='왕관')
    for reward in crown_icons:
        reward.reward_type = 'special_icon'
        reward.reward_value = 'crown'
        reward.save()
    
    star_icons = Reward.objects.filter(name__contains='별')
    for reward in star_icons:
        reward.reward_type = 'special_icon'
        reward.reward_value = 'star'
        reward.save()
    
    # 부스터 유형 업데이트
    xp_boosters = Reward.objects.filter(name__contains='경험치')
    for reward in xp_boosters:
        reward.reward_type = 'booster'
        reward.reward_value = 'xp'
        reward.save()
    
    coin_boosters = Reward.objects.filter(name__contains='코인')
    for reward in coin_boosters:
        reward.reward_type = 'booster'
        reward.reward_value = 'coin'
        reward.save()

class Migration(migrations.Migration):
    dependencies = [
        ('rewards', '0002_alter_reward_cost'),
    ]

    operations = [
        migrations.AddField(
            model_name='reward',
            name='reward_type',
            field=models.CharField(choices=[('background', '배경화면'), ('profile_frame', '프로필 프레임'), ('special_icon', '특수 아이콘'), ('booster', '부스터'), ('other', '기타')], default='other', max_length=20),
        ),
        migrations.AddField(
            model_name='reward',
            name='reward_value',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.RunPython(update_reward_types),
    ]