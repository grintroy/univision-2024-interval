from django.shortcuts import render, redirect

from .models import Position, Score, Team


def index(request):
    return redirect("scores")


def scores(request):
    return render(
        request,
        "scores.html",
        {
            "title": "Scores",
            "teams": Team.objects.all().order_by("index"),
        },
    )
