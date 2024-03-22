import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from scores.models import Team, Score, Position


class ScoreConsumer(WebsocketConsumer):
    def connect(self):
        self.group_name = "public"
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    def receive(self, text_data):
        json_text = json.loads(text_data)
        event = json_text["event"]

        print(f"Received event: {event}, {json_text}")

        match event:
            case "get_points":
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_scores"}
                )
            case "get_transform":
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_transform"}
                )
            case "add_points":
                team = Team.objects.get(color=json_text["color"])
                points = json_text["n"]
                score = team.score
                new_score = score.score + points
                if new_score < 0:
                    self.set_points(team, 0)
                else:
                    self.set_points(team, new_score)
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_scores"}
                )
            case "set_points":
                team = Team.objects.get(color=json_text["color"])
                points = json_text["n"]
                self.set_points(team, points)
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_scores"}
                )
            case "reset_scores":
                team = Team.objects.get(color=json_text["color"])
                self.reset(team)
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_scores"}
                )
            case "reset_all_scores":
                teams = Team.objects.all()
                for team in teams:
                    self.reset(team)
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_scores"}
                )
            case "reset_all_transformations":
                teams = Team.objects.all()
                for team in teams:
                    position = team.score.position
                    position.dx_px = 0
                    position.dy_px = 0
                    position.rotate_deg = 0
                    position.scale = 1
                    position.save()
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_transform"}
                )
            case "transform":
                team = Team.objects.get(color=json_text["color"])
                mode = json_text["mode"]
                match mode:
                    case "rotate":
                        self.rotate(team, json_text["value"])
                    case "translate":
                        self.translate(team, json_text["value"])
                    case "scale":
                        self.scale(team, json_text["value"])
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {"type": "update_transform"}
                )
            case _:
                print("Unknown event")

    def set_points(self, team: Team, points: int):
        score = team.score
        score.score = points
        score.save()

    def reset(self, team: Team):
        score = team.score
        score.score = 0
        score.save()

    def rotate(self, team: Team, direction: str):
        DCHANGE = 0.5  # in deg
        position = team.score.position
        rotation = position.rotate_deg

        match direction:
            case "c":
                position.rotate_deg = rotation + DCHANGE
            case "cc":
                position.rotate_deg = rotation - DCHANGE

        position.save()

    def translate(self, team: Team, direction: str):
        DCHANGE = 5  # in px
        position = team.score.position

        match direction:
            case "up":
                position.dy_px = position.dy_px - DCHANGE
            case "down":
                position.dy_px = position.dy_px + DCHANGE
            case "left":
                position.dx_px = position.dx_px - DCHANGE
            case "right":
                position.dx_px = position.dx_px + DCHANGE

        position.save()

    def scale(self, team: Team, direction: str):
        DCHANGE = 0.01
        position = team.score.position
        scale = position.scale

        match direction:
            case "up":
                position.scale = scale + DCHANGE
            case "down":
                position.scale = scale - DCHANGE

        position.save()

    def update_scores(self, event):
        teams = Team.objects.all().order_by("index")
        scores = [
            {
                "color": team.color,
                "score": team.score.score,
            }
            for team in teams
        ]
        self.send(text_data=json.dumps({"event": "update_scores", "scores": scores}))

    def update_transform(self, event):
        teams = Team.objects.all()
        transforms = [
            {
                "color": team.color,
                "transform": {
                    "dx_px": team.score.position.dx_px,
                    "dy_px": team.score.position.dy_px,
                    "rotate_deg": team.score.position.rotate_deg,
                    "scale": team.score.position.scale,
                },
            }
            for team in teams
        ]
        self.send(
            text_data=json.dumps(
                {"event": "update_transform", "transforms": transforms}
            )
        )
