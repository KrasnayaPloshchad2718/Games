//room.js

let authority = "False"
let playername = "";
let state = 0
async function decision(){
    const res = await getRoomState(roomId);
    playername = document.getElementById("name_input").value;
    const re = await registerPlayer(roomId, playername
    );
    if (re.status === "ok"){
        document.getElementById("name").style.display = "none";
        document.getElementById("waiting").style.display = "block";
        document.getElementById("game-select").style.display = "none";
        document.getElementById("start_button").style.display = "none";
    }else{
        document.getElementById("name").innerHTML = "名前が重複しています。別の名前を入力してください。";
    }
};


async function getWord() {
    try {
        const response = await fetch("/api/getwords", {
            method: "GET",
            cache: "no-cache"
        });

        const data = await response.json();

        if (data.status === "ok") {
            console.log("NGワード:", data.word);
            return data.word;
        } else {
            console.error("NGワード取得失敗:", data);
            return null;
        }

    } catch (error) {
        console.error("通信エラー:", error);
        return null;
    }
}


async function startGame() {
    if (authority === "True"){
    try {
        const response = await fetch("/api/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: roomId
            })
        });

        const data = await response.json();

        console.log("開始結果:", data);

        if (data.status === "ok") {
            console.log("ゲーム開始");

            document.getElementById("waiting").style.display = "none";
            document.getElementById("game").style.display = "block";

        } else {
            console.error("開始失敗:", data.text);
        }

    } catch (error) {
        console.error("通信エラー:", error);
    }
    }
}

async function getRoomState(roomId) {
    try {
        const response = await fetch("/api/roomstate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: roomId
            }),
            cache: "no-cache"
        });

        const data = await response.json();

        console.log("RoomState:", data);

        return data;
    }
    catch (error) {
        console.error("通信エラー:", error);
        return null;
    }
}

async function registerPlayer(roomId, name) {
    try {
        const response = await fetch("/api/room/player", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: roomId,
                name: name
            })
        });
        
        const data = await response.json();
        document.getElementById("player_name").innerHTML = name;
        console.log("登録結果:", data);

        return data;
    }
    catch (error) {
        console.error("通信エラー:", error);
        return null;
    }
}

async function endGame() {

    // ホスト以外は何もしない
    if (authority !== "True") {
        return;
    }

    document.getElementById("game").style.display = "none";
    document.getElementById("select").style.display = "block";
}

async function continueGame() {

    if (authority !== "True") {
        return;
    }

    try {
        const response = await fetch("/api/continue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: roomId
            })
        });

        const data = await response.json();

        console.log("継続結果:", data);

        if (data.status === "ok") {

            document.getElementById("select").style.display = "none";
            document.getElementById("game").style.display = "none";
            document.getElementById("waiting").style.display = "block";

            // ホストだけ開始操作をできる
            document.getElementById("game-select").style.display = "block";
            document.getElementById("start_button").style.display = "block";

            state = 0;

        } else {
            console.error("継続失敗:", data.text);
        }

    } catch (error) {
        console.error("通信エラー:", error);
    }
}

async function finishGame() {

    if (authority !== "True") {
        return;
    }

    try {
        const response = await fetch("/api/end", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: roomId
            })
        });

        const data = await response.json();

        console.log("終了結果:", data);

        if (data.status === "ok") {

            document.getElementById("select").style.display = "none";
            document.getElementById("game").style.display = "none";
            document.getElementById("waiting").style.display = "block";

            document.getElementById("game-select").style.display = "none";
            document.getElementById("start_button").style.display = "none";

        }

    } catch (error) {
        console.error("通信エラー:", error);
    }
}

async function shokika(){
    const name = sessionStorage.getItem("player_name");
    state = 0
    if(name==null){
        document.getElementById("name").style.display = "block";
        document.getElementById("waiting").style.display = "none";
        document.getElementById("game").style.display = "none";
    }else{
        document.getElementById("name").style.display = "none";
        document.getElementById("waiting").style.display = "block";
        document.getElementById("game").style.display = "none";
        playername = name 
        const res = await registerPlayer(roomId, name);

            if (res !== null && res.status === "ok") {
                console.log("登録成功");
            }   
    }
    
    const res = await getRoomState(roomId);
    const host = res.room.host;
    if (host === name){
    authority = "True";
    }else{
    authority = "False";
    }

};

function updatePlayerList(players, host) {
    const list = document.getElementById("player_list");

    // 一度空にする
    list.innerHTML = "";

    players.forEach(name => {
        const li = document.createElement("li");

        li.className = "player";

        if (name === host) {
            li.textContent = "★ " + name + "（ホスト）";
        } else {
            li.textContent = name;
        }

        list.appendChild(li);
    });
}

let word = ""

setInterval(async () => {

    const res = await getRoomState(roomId);

    if (res === null) {
        return;
    }

    updatePlayerList(
        res.room.players,
        res.room.host
    );

    const roomState = res.room.state;

    // =========================
    // ゲーム開始
    // =========================

    if (roomState === "開始済み" && state === 0) {

        document.getElementById("waiting").style.display = "none";
        document.getElementById("select").style.display = "none";
        document.getElementById("game").style.display = "block";

        if (authority === "True") {
            document.getElementById("end_game").style.display = "block";
        } else {
            document.getElementById("end_game").style.display = "none";
        }

        const words = res.room.game.words;

        const otherWords = Object.entries(words)
            .filter(([name, word]) => name !== playername);

        document.getElementById("game_text").innerHTML =
            otherWords
                .map(([name, word]) => `${name}：${word}`)
                .join("<br>");

        document.getElementById("round_text").textContent =
            `第 ${res.room.game.round + 1} ラウンド`;

        state = 1;
    }
    // =========================
    // ゲーム終了 → 待機
    // =========================

    if (roomState === "終了") {

        document.getElementById("game").style.display = "none";
        document.getElementById("select").style.display = "none";
        document.getElementById("waiting").style.display = "block";

        state = 0;
    }


    // =========================
    // 継続
    // =========================

    if (roomState === "開始待ち" && state === 1) {

        document.getElementById("game").style.display = "none";
        document.getElementById("select").style.display = "none";
        document.getElementById("waiting").style.display = "block";

        // ホストだけ開始操作可能
        if (authority === "True") {
            document.getElementById("game-select").style.display = "block";
            document.getElementById("start_button").style.display = "block";
        } else {
            document.getElementById("game-select").style.display = "none";
            document.getElementById("start_button").style.display = "none";
        }

        state = 0;
    }

}, 1000);

const conditions = [
    ["no_price", "特にこのボックスに意味はないです"],
    ["other", "その他"]
];

const selectBox = document.getElementById("game-select");
const current = selectBox.querySelector(".select-current");
const optionsBox = selectBox.querySelector(".select-options");

let selectedValue = null;

// 選択肢を生成
conditions.forEach(([value, text]) => {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.dataset.value = value;

    button.addEventListener("click", () => {

        current.childNodes[0].textContent = text;

        selectedValue = value;

        selectBox.classList.remove("open");

        console.log("選択:", selectedValue);
    });

    optionsBox.appendChild(button);
});

// 選択ボックスを開く
current.addEventListener("click", () => {
    selectBox.classList.toggle("open");
});


document.addEventListener("DOMContentLoaded", function() {
    shokika();
});
