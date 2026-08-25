from flask import Flask, render_template, request
import random
import secrets

app = Flask(__name__)

ng_words = [
    "学校", "先生", "宿題", "テスト", "授業",
    "友達", "家族", "兄弟", "名前", "年齢",
    "今日", "明日", "昨日", "朝", "夜",
    "天気", "雨", "雪", "晴れ", "暑い",
    "寒い", "夏", "冬", "春", "秋",
    "東京", "京都", "大阪", "北海道", "沖縄",
    "駅", "電車", "バス", "車", "自転車",
    "旅行", "映画", "音楽", "ゲーム", "漫画",
    "本", "テレビ", "スマホ", "パソコン", "写真",
    "猫", "犬", "鳥", "魚", "馬",
    "動物", "虫", "海", "山", "川",
    "ラーメン", "寿司", "カレー", "パン", "ピザ",
    "肉", "魚", "野菜", "果物", "お菓子",
    "チョコ", "ケーキ", "アイス", "コーヒー", "紅茶",
    "水", "ジュース", "牛乳", "朝食", "昼食",
    "夕食", "食べる", "飲む", "寝る", "起きる",
    "歩く", "走る", "行く", "帰る", "見る",
    "聞く", "話す", "読む", "書く", "買う",
    "好き", "嫌い", "楽しい", "嬉しい", "悲しい",
    "怖い", "面白い", "つまらない", "難しい", "簡単",
    "大きい", "小さい", "長い", "短い", "高い",
    "安い", "新しい", "古い", "赤", "青",
    "白", "黒", "黄色", "緑", "紫",
    "数字", "一", "二", "三", "十",
    "百", "千", "時間", "時計", "分",
    "お金", "財布", "買い物", "店", "コンビニ",
    "スーパー", "レストラン", "病院", "公園", "学校",
    "先生", "学生", "会社", "仕事", "休み",
    "スポーツ", "野球", "サッカー", "テニス", "バスケ",
    "水泳", "試合", "選手", "ボール", "勝つ",
    "負ける", "ゲーム", "勝負", "ルール", "ポイント",
    "パーティー", "誕生日", "クリスマス", "正月", "祭り",
    "花火", "プレゼント", "旅行", "休日", "イベント",
    "日本", "外国", "中国", "韓国", "アメリカ",
    "ロシア", "フランス", "英語", "日本語", "中国語",
    "ロシア語", "電話", "メール", "SNS", "インターネット",
    "動画", "YouTube", "写真", "カメラ", "パスワード",
    "名前", "秘密", "質問", "答え", "理由",
    "問題", "本当", "嘘", "たぶん", "絶対",
    "もちろん", "もしもし", "ありがとう", "ごめん",
    "こんにちは", "さようなら", "どうして", "なぜ",
    "誰", "どこ", "いつ"
]

room_list = []
room_state = {}

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/state", methods=["POST"])
def get_state():
    data = request.get_json()

    text = data["text"]
    name = data.get("name")

    if text in room_list:
        return {
            "state": "Not Allowed"
        }

    if not name:
        return {
            "state": "Name Required"
        }, 400

    # ホスト専用トークン
    host_token = secrets.token_hex(32)

    room_list.append(text)

    room_state[text] = {
        "host_token": host_token,
        "host_name": name,
        # token -> player情報
        "players": {},

        "state": "開始待ち",

        "game": {
            "words": {},
            "turn": 0,
            "round": 0,
        },

        "vote": {},

        # 継続処理用
        "reload": False,
    }

    return {
        "state": "Allowed",
        "host_token": host_token
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

    room = room_state[room_id]

    # 既に同じ名前が存在するか
    for player in room["players"].values():
        if player["name"] == name:
            return {
                "status": "error",
                "message": "その名前は既に使用されています"
            }, 409

    player_token = secrets.token_hex(32)

    room["players"][player_token] = {
        "name": name
    }

    return {
        "status": "ok",
        "player_token": player_token,
        "players": [
            player["name"]
            for player in room["players"].values()
        ]
    }


@app.route("/api/room/reconnect", methods=["POST"])
def reconnect_player():
    data = request.get_json()

    room_id = data["room_id"]
    player_token = data["player_token"]

    if room_id not in room_state:
        return {
            "status": "error",
            "message": "部屋が存在しません"
        }, 404

    room = room_state[room_id]

    # ホスト
    if player_token == room["host_token"]:
        return {
            "status": "ok",
            "role": "host",
            "name": room.get("host_name")
        }

    # 一般プレイヤー
    if player_token in room["players"]:
        return {
            "status": "ok",
            "role": "player",
            "name": room["players"][player_token]["name"]
        }

    return {
        "status": "error",
        "message": "認証情報が無効です"
    }, 401


@app.route("/api/start", methods=["POST"])
def start_game():
    data = request.get_json()

    room_id = data["room_id"]
    host_token = data["host_token"]

    if room_id not in room_state:
        return {
            "status": "error",
            "text": "部屋が存在しません"
        }, 404

    room = room_state[room_id]

    # ホストか確認
    if host_token != room["host_token"]:
        return {
            "status": "error",
            "text": "ホストではありません"
        }, 403

    players = room["players"]

    word_dict = {}

    for player_token, player in players.items():
        word_dict[player["name"]] = random.choice(ng_words)

    room["game"]["words"] = word_dict
    room["state"] = "開始済み"

    return {
        "status": "ok",
        "words": word_dict,
        "text": "開始完了"
    }


@app.route("/api/end", methods=["POST"])
def end_game():
    data = request.get_json()

    room_id = data["room_id"]
    host_token = data["host_token"]

    if room_id not in room_state:
        return {
            "status": "error",
            "text": "部屋が存在しません"
        }, 404

    room = room_state[room_id]

    if host_token != room["host_token"]:
        return {
            "status": "error",
            "text": "ホストではありません"
        }, 403

    room["state"] = "終了確認"

    return {
        "status": "ok",
        "text": "終了確認へ移行"
    }


@app.route("/api/continue", methods=["POST"])
def continue_game():
    data = request.get_json()

    room_id = data["room_id"]
    host_token = data["host_token"]

    if room_id not in room_state:
        return {
            "status": "error",
            "text": "部屋が存在しません"
        }, 404

    room = room_state[room_id]

    if host_token != room["host_token"]:
        return {
            "status": "error",
            "text": "ホストではありません"
        }, 403

    # ラウンドを1増加
    room["game"]["round"] += 1

    # 次のゲーム用に初期化
    room["game"]["words"] = {}
    room["game"]["turn"] = 0

    room["state"] = "開始待ち"

    # 全員にリロードを要求
    room["reload"] = True

    return {
        "status": "ok",
        "round": room["game"]["round"]
    }


@app.route("/api/roomstate", methods=["POST"])
def get_roomstate():
    data = request.get_json()

    room_id = data["room_id"]

    if room_id not in room_state:
        return {
            "status": "error",
            "message": "部屋が存在しません"
        }, 404

    room = room_state[room_id]

    return {
        "status": "ok",
        "room": {
            "players": [
                player["name"]
                for player in room["players"].values()
            ],
            "host": room.get("host_name"),
            "state": room["state"],
            "game": room["game"],
            "reload": room["reload"]
        }
    }


@app.route("/api/reload_done", methods=["POST"])
def reload_done():
    data = request.get_json()

    room_id = data["room_id"]

    if room_id not in room_state:
        return {
            "status": "error"
        }, 404

    # リロード要求を解除
    room_state[room_id]["reload"] = False

    return {
        "status": "ok"
    }


@app.route("/room/<room_id>")
def room(room_id):
    if room_id in room_list:
        return render_template(
            "room.html",
            room_id=room_id
        )

    return "部屋が存在しません", 404


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )