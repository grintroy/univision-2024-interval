from django.shortcuts import render, redirect

from .models import Position, Score, Team


def index(request):
    return redirect("scores")


def scores(request):
    if request.method == "GET":
        host = request.GET.get("host")
    return render(
        request,
        "scores.html",
        {
            "title": "Scores",
            "teams": Team.objects.all().order_by("index"),
            "host": host,
        },
    )
