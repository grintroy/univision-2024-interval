from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Position(models.Model):
    dx_px = models.FloatField(default=0)
    dy_px = models.FloatField(default=0)
    rotate_deg = models.FloatField(default=0)
    scale = models.FloatField(default=1)
    score = models.OneToOneField("Score", on_delete=models.CASCADE, editable=False)

    def __str__(self):
        return f"{self.score.team}: dx={self.dx_px}, dy={self.dy_px}, {self.rotate_deg} deg, x{self.scale}"


class Score(models.Model):
    score = models.IntegerField(default=0)
    team = models.OneToOneField("Team", on_delete=models.CASCADE, editable=False)

    def __str__(self):
        return self.team.color + ": " + str(self.score)


@receiver(post_save, sender=Score)
def create_position(sender, instance, created, **kwargs):
    if created:
        Position.objects.create(score=instance)


class Team(models.Model):
    color = models.CharField(max_length=20)

    def __str__(self):
        return self.color


@receiver(post_save, sender=Team)
def create_score(sender, instance, created, **kwargs):
    if created:
        Score.objects.create(team=instance)
