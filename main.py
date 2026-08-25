from flask import Flask, render_template, request

app = Flask(__name__)

room_list = []
room_state = {}

test_text = ""

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state", methods=["POST"])
def get_state():
    data = request.get_json()

    text = data["text"]
    name = data.get("name")

    print("受信:", text, name)

    if text in room_list:
        # 既存の部屋
        statement = "Not Allowed"

    else:
        # 部屋作成
        if not name:
            return {
                "state": "Name Required"
            }, 400

        statement = "Allowed"

        room_list.append(text)

        room_state[text] = {
            "host": name,
            "players": [],
            "state": "開始待ち",
            "game": {
                "words": {},
                "turn": 0,
                "round": 0,
            },
            "vote": {},
        }

    return {
        "state": statement
    }

@app.route("/api/room/player", methods=["POST"])
def register_player():
    data = request.get_json()

    room_id = data["room_id"]
    name = data["name"]

    if room_id not in room_state:
        return {
            "status": "error",
            "message": "部屋が存在しません"
        }, 404

    if name in room_state[room_id]["players"]:
        return {
            "status": "error",
            "message": "その名前は既に使用されています"
        }, 409

    room_state[room_id]["players"].append(name)

    return {
        "status": "ok",
        "players": room_state[room_id]["players"]
    }


@app.route("/api/test", methods=["POST"])
def test():
    global test_text

    data = request.get_json()

    test_text = data["text"]

    print("受信:", test_text)

    return {"status": "ok content={}".format(test_text)}

@app.route("/room/<room_id>")
def room(room_id):
    if room_id in room_list:
        return render_template("room.html", room_id=room_id)
    else:
        return "部屋が存在しません", 404

conditions = {
    "weather": "天気"
    #ほかの話題も追加
}

@app.route("/api/conditions")
def get_conditions():
    return {
        "status": "ok",
        "conditions": conditions
    }

@app.route("/api/start", methods=["POST"])
def startGame():
    data = request.get_json()
    room_id = data["text"]
    if room_id in room_state:
        room_state[room_id]["state"] = "開始済み"
        return {"status":"ok",
                "text":"開始完了"}
    else:
        return {"status":"error",
                "text":"エラーが発生"},404



@app.route("/api/roomstate", methods=["POST"])
def get_roomstate():
    data = request.get_json()

    room_id = data["room_id"]

    if room_id not in room_state:
        return {
            "status": "error",
            "message": "部屋が存在しません"
        }, 404

    return {
        "status": "ok",
        "room": room_state[room_id]
    }


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )