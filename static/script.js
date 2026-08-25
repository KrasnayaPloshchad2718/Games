//script.js
let state = 0;
const Text1list = [
    "開始待ち",
    "ゲーム中",
    "ゲーム終了"
];
const Button1list = [
    "接続",
    "スタート",
    "リセット"
];

function hyouji(){
    document.getElementById("Text1").innerHTML = Text1list[state];
    document.getElementById("Button1Text").innerHTML = Button1list[state];
};


async function getState(text, name) {
    try {
        const response = await fetch("/api/state", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                name: name
            }),
            cache: "no-cache"
        });

        const data = await response.json();

        console.log("サーバーからの応答:", data);

        return data;
    }
    catch (error) {
        console.error("通信エラー:", error);
        return null;
    }
}


async function Button1Click(){
    const roomId = document.getElementById("TextBox1").value;
    const name = document.getElementById("name_input").value;

    if (roomId === "" || name === "") {
        document.getElementById("Text1").innerHTML =
            "番号・名前を入力してください";
        return;
    }

    const res = await getState(roomId, name);

    if (res.state === "Allowed") {
        sessionStorage.setItem("player_name", name);
        window.location.href =
            "/room/" + encodeURIComponent(roomId);
    }
    else {
        document.getElementById("Text1").innerHTML =
            "その番号は使用できません";
    }
}

async function Button2Click(){
    const roomId = document.getElementById("TextBox1").value;

    if (roomId === "") {
        document.getElementById("Text1").innerHTML =
            "番号を入力してください";
        return;
    }

    const res = await getState(roomId);

    if (res.state === "Not Allowed") {
        window.location.href =
            "/room/" + encodeURIComponent(roomId);
    }
    else {
        document.getElementById("Text1").innerHTML =
            "部屋が存在しません";
    }
}

document.getElementById("TextBox1").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const text = this.value;

        fetch("/api/test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text
            })
        })
        .then(response => response.text())
        .then(response => {
            console.log("サーバーからの応答:", response);
        });
    }
});

function shokika(){
state = 0;
sessionStorage.removeItem("player_name");
};

document.addEventListener("DOMContentLoaded", function() {
    shokika();
});

