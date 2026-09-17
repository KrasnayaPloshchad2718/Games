from flask import Flask, render_template, request
import random


# ==============================
# NGワード一覧
# ==============================

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
    "ロシア語",
    "電話", "メール", "SNS", "インターネット", "動画",
    "YouTube", "写真", "カメラ", "パスワード", "名前",
    "秘密", "質問", "答え", "理由", "問題",
    "本当", "嘘", "たぶん", "絶対", "もちろん",
    "もしもし", "ありがとう", "ごめん", "こんにちは", "さようなら"
]

ng_words += [

    # 名詞：日常生活
    "家", "部屋", "玄関", "窓", "ドア",
    "机", "椅子", "ベッド", "布団", "階段",
    "鍵", "傘", "靴", "服", "帽子",
    "時計", "電池", "電気", "鏡", "箱",

    # 名詞：食べ物・飲み物
    "卵", "ご飯", "おにぎり", "サンドイッチ", "うどん",
    "そば", "スープ", "牛肉", "豚肉", "鶏肉",
    "塩", "砂糖", "醤油", "箸", "皿",
    "コップ", "弁当", "お茶", "水筒", "冷蔵庫",

    # 名詞：人・社会
    "父親", "母親", "兄", "姉", "弟",
    "妹", "祖父", "祖母", "隣人", "客",
    "店員", "医者", "警察", "駅員", "運転手",
    "大人", "子供", "男性", "女性", "人",

    # 名詞：場所・自然
    "家", "建物", "道路", "橋", "信号",
    "交差点", "図書館", "体育館", "教室", "トイレ",
    "病気", "薬", "病院", "川", "湖",
    "島", "森", "花", "木", "石",

    # 名詞：物・概念
    "色", "形", "大きさ", "番号", "住所",
    "手紙", "荷物", "袋", "紙", "鉛筆",
    "ペン", "消しゴム", "問題", "答え", "理由",
    "約束", "予定", "方法", "意見", "気持ち",

    # 形容詞
    "暖かい", "涼しい", "柔らかい", "硬い", "深い",
    "浅い", "太い", "細い", "広い", "狭い",
    "丸い", "四角い", "白い", "黒い", "赤い",
    "青い", "黄色い", "明るい", "暗い", "静か",
    "うるさい", "きれい", "汚い", "便利", "不便",
    "元気", "有名", "大切", "必要", "危険",
    "安全", "新鮮", "甘い", "酸っぱい", "苦い",

    # 動詞：日常動作
    "入る", "出る", "開く", "閉じる", "乗る",
    "降りる", "曲がる", "止まる", "動く", "飛ぶ",
    "泳ぐ", "寝る", "起きる", "座る", "立つ",
    "着る", "脱ぐ", "洗う", "掃除する", "料理する",
    "使う", "作る", "直す", "捨てる", "拾う",

    # 動詞：会話・思考
    "思う", "考える", "知る", "分かる", "忘れる",
    "覚える", "教える", "習う", "答える", "尋ねる",
    "説明する", "選ぶ", "決める", "比べる", "調べる",
    "伝える", "呼ぶ", "返す", "約束する", "相談する",

    # 動詞：状態・行動
    "始まる", "終わる", "続く", "変わる", "増える",
    "減る", "当たる", "外れる", "勝つ", "負ける",
    "笑う", "泣く", "怒る", "驚く", "困る",
    "喜ぶ", "楽しむ", "疲れる", "頑張る", "休む",

    # 副詞・会話で使いやすい語
    "少し", "たくさん", "とても", "かなり", "本当に",
    "一緒に", "すぐに", "あとで", "いつも", "時々",
    "まだ", "もう", "また", "ここ", "そこ",
    "どこ", "誰", "何", "なぜ", "どうして"

]

# ==============================
# Flask設定
# ==============================

app = Flask(__name__)


# ==============================
# 部屋データ
# ==============================

room_list = []
room_state = {}

test_text = ""


# ==============================
# トップページ
# ==============================

@app.route("/")
def index():

    return render_template("index.html")


# ==============================
# 部屋作成・接続確認
# ==============================

@app.route("/api/state", methods=["POST"])
def get_state():

    data = request.get_json()

    text = data["text"]
    name = data.get("name")

    print("受信:", text, name)

    if text in room_list:

        statement = "Not Allowed"

    else:

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

                "round": 0

            },

            "vote": {}

        }

    return {

        "state": statement

    }


# ==============================
# プレイヤー登録
# ==============================

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


# ==============================
# テストAPI
# ==============================

@app.route("/api/test", methods=["POST"])
def test():

    global test_text

    data = request.get_json()

    test_text = data["text"]

    print("受信:", test_text)

    return {

        "status": "ok content={}".format(test_text)

    }


# ==============================
# 部屋ページ
# ==============================

@app.route("/room/<room_id>")
def room(room_id):

    if room_id in room_list:

        return render_template(

            "room.html",

            room_id=room_id

        )

    else:

        return "部屋が存在しません", 404


# ==============================
# 条件一覧
# ==============================

conditions = {

    "weather": "天気"

}


@app.route("/api/conditions")
def get_conditions():

    return {

        "status": "ok",

        "conditions": conditions

    }


# ==============================
# ゲーム開始
# ==============================

@app.route("/api/start", methods=["POST"])
def startGame():

    data = request.get_json()

    room_id = data["text"]

    words = []

    word_dict = {}

    if room_id in room_state:

        players = room_state[room_id]["players"]

        for i in range(len(players)):

            word = random.choice(ng_words)

            words.append(word)

            word_dict.setdefault(

                players[i],

                word

            )

        room_state[room_id]["game"]["words"] = word_dict

        room_state[room_id]["state"] = "開始済み"

        return {

            "status": "ok",

            "words": word_dict,

            "text": "開始完了"

        }

    else:

        return {

            "status": "error",

            "text": "エラーが発生"

        }, 404


# ==============================
# 部屋状態取得
# ==============================

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


# ==============================
# ゲームデータ初期化
# ==============================
# 継続が選択されたときに実行
# プレイヤーとホストは維持
# ゲームデータのみ初期化
# ==============================

@app.route("/api/room/data_delete", methods=["POST"])
def delete_room_data():

    data = request.get_json()

    room_id = data.get("room_id")

    if room_id not in room_state:

        return {

            "status": "error",

            "message": "部屋が存在しません"

        }, 404

    room = room_state[room_id]

    # ゲーム状態を初期化

    room["state"] = "開始待ち"

    room["game"] = {

        "words": {},

        "turn": 0,

        "round": 0

    }

    room["vote"] = {}

    print(

        "ゲームデータ初期化:",

        room_id

    )

    return {

        "status": "ok",

        "message": "ゲームデータを初期化しました"

    }


# ==============================
# サーバー起動
# ==============================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=10000

    )