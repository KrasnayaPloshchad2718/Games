from flask import Flask, render_template, request
import random

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
    "ロシア", "フランス", "英語", "日本語", "中国語","ロシア語",
    "電話", "メール", "SNS", "インターネット", "動画",
    "YouTube", "写真", "カメラ", "パスワード", "名前",
    "秘密", "質問", "答え", "理由", "問題",
    "本当", "嘘", "たぶん", "絶対", "もちろん",
    "もしもし", "ありがとう", "ごめん", "こんにちは", "さようなら",
    "どうして", "なぜ", "誰", "どこ", "いつ"
]

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
    words = []
    word_dict = {}
    if room_id in room_state:
        players = room_state[room_id]["players"]
        for i in range(len(room_state[room_id]["players"])):
            word = (random.choice(ng_words))
            words.append(word)
            word_dict.setdefault(players[i],word)
        room_state[room_id]["game"]["words"] = word_dict
        room_state[room_id]["state"] = "開始済み"
        return {"status":"ok",
                "words":word_dict,
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



    
    return {"status":"ok",
            "word":words}

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )