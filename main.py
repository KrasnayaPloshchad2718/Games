from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state")
def get_state():
    return {"state":"開始待ち"}


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )