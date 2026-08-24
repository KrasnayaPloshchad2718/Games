from flask import Flask, render_template, request

app = Flask(__name__)

test_text = ""

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state")
def get_state():
    if test_text:
        return {"state":"{}".format(test_text)}
    else:
        return {"state":"開始待ち"}

@app.route("/api/test", methods=["POST"])
def test():
    global test_text

    data = request.get_json()

    test_text = data["text"]

    print("受信:", test_text)

    return {"status": "ok content={}".format(test_text)}



if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )