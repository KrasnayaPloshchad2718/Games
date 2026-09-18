// ==============================
// room.js
// ==============================

let authority = "False";
let playername = "";
let word = "";
let state = 0;


// ==============================
// プレイヤー登録
// ==============================

async function registerPlayer(roomId, name) {

    try {

        const response = await fetch(
            "/api/room/player",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    room_id: roomId,
                    name: name
                })
            }
        );

        const data = await response.json();

        const playerNameElement =
            document.getElementById("player_name");

        if (playerNameElement) {
            playerNameElement.innerHTML = name;
        }

        console.log("登録結果:", data);

        return data;

    } catch (error) {

        console.error("通信エラー:", error);

        return null;
    }
}


// ==============================
// 部屋状態取得
// ==============================

async function getRoomState(roomId) {

    try {

        const response = await fetch(
            "/api/roomstate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    room_id: roomId
                }),

                cache: "no-cache"
            }
        );

        const data = await response.json();

        console.log("RoomState:", data);

        return data;

    } catch (error) {

        console.error("通信エラー:", error);

        return null;
    }
}


// ==============================
// 初期化
// ==============================

async function shokika() {

    const name = sessionStorage.getItem(
        "player_name"
    );

    console.log(name ?? "None");

    if (name == null) {

        document.getElementById(
            "name"
        ).style.display = "block";

        document.getElementById(
            "waiting"
        ).style.display = "none";

        document.getElementById(
            "game"
        ).style.display = "none";

        document.getElementById(
            "select"
        ).style.display = "none";

    } else {

        document.getElementById(
            "name"
        ).style.display = "none";

        document.getElementById(
            "waiting"
        ).style.display = "block";

        document.getElementById(
            "game"
        ).style.display = "none";

        document.getElementById(
            "select"
        ).style.display = "none";

        playername = name;

        const res = await registerPlayer(
            roomId,
            name
        );

        if (
            res !== null &&
            res.status === "ok"
        ) {

            console.log("登録成功");

        } else {

            console.log("登録失敗");

        }
    }

    const res = await getRoomState(roomId);

    if (
        res === null ||
        res.status !== "ok"
    ) {
        return;
    }

    const host = res.room.host;

    if (host === name) {

        authority = "True";

    } else {

        authority = "False";

    }
}


// ==============================
// 名前決定
// ==============================

async function decision() {

    const nameInput =
        document.getElementById("name_input");

    playername = nameInput.value.trim();

    if (playername === "") {

        document.getElementById(
            "name"
        ).innerHTML =
            "名前を入力してください";

        return;
    }

    const re = await registerPlayer(
        roomId,
        playername
    );

    if (
        re !== null &&
        re.status === "ok"
    ) {

        sessionStorage.setItem(
            "player_name",
            playername
        );

        document.getElementById(
            "name"
        ).style.display = "none";

        document.getElementById(
            "waiting"
        ).style.display = "block";

        document.getElementById(
            "game-select"
        ).style.display = "block";

        document.getElementById(
            "start_button"
        ).style.display = "block";

        const res = await getRoomState(
            roomId
        );

        if (
            res !== null &&
            res.status === "ok"
        ) {

            if (
                res.room.host === playername
            ) {

                authority = "True";

            } else {

                authority = "False";

            }
        }

    } else {

        document.getElementById(
            "name"
        ).innerHTML =
            "名前が重複しています。別の名前を入力してください。";
    }
}


// ==============================
// プレイヤー一覧表示
// ==============================

function updatePlayerList(
    players,
    host
) {

    const list =
        document.getElementById(
            "player_list"
        );

    list.innerHTML = "";

    players.forEach(name => {

        const li =
            document.createElement("li");

        li.className = "player";

        if (name === host) {

            li.textContent =
                "★ " +
                name +
                "（ホスト）";

        } else {

            li.textContent = name;

        }

        list.appendChild(li);

    });
}


// ==============================
// ゲーム開始
// ==============================
async function startGame() {
    if (authority !== "True") {
        alert("ホストのみ開始できます");
        return;
    }

    try {
        const res = await fetch("/api/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: roomId
            })
        });

        const data = await res.json();

        if (!res.ok || data.status !== "ok") {
            alert(data.message || "ゲーム開始に失敗しました");
            return;
        }

        // 待機画面を非表示
        document.getElementById("waiting").style.display = "none";

        // ゲーム画面を表示
        document.getElementById("game").style.display = "block";

        // 選択画面を非表示
        document.getElementById("select").style.display = "none";

        // stateを0に戻す
        // ポーリング側のワード表示処理を実行させる
        state = 0;

    } catch (error) {
        console.error("ゲーム開始エラー:", error);
        alert("ゲーム開始中にエラーが発生しました");
    }
}

// ==============================
// 終了ボタン
// ==============================

function endGame() {
    if(authority === "True"){
    document.getElementById(
        "game"
    ).style.display = "none";

    document.getElementById(
        "select"
    ).style.display = "block";
    }
}


// ==============================
// ゲームデータ初期化API
// ==============================

async function deleteRoomData(roomId) {

    try {

        const response = await fetch(
            "/api/room/data_delete",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    room_id: roomId
                })
            }
        );

        const data = await response.json();

        console.log("初期化結果:", data);

        return data;

    } catch (error) {

        console.error("通信エラー:", error);

        return null;
    }
}


// ==============================
// 継続
// ==============================

async function continueGame() {

    if (authority !== "True") {

        return;
    }

    const res = await deleteRoomData(
        roomId
    );

    if (
        res !== null &&
        res.status === "ok"
    ) {

        document.getElementById(
            "select"
        ).style.display = "none";

        document.getElementById(
            "game"
        ).style.display = "none";

        document.getElementById(
            "waiting"
        ).style.display = "block";

        state = 0;

        document.getElementById(
            "game_text"
        ).innerHTML = "";

        console.log("ゲームを継続します");

    } else {

        console.error(
            "初期化に失敗しました"
        );

    }
}


// ==============================
// 終了
// ==============================

function finishGame() {

    document.getElementById(
        "select"
    ).style.display = "none";

    document.getElementById(
        "waiting"
    ).style.display = "block";

    document.getElementById(
        "game"
    ).style.display = "none";

    state = 0;

}


// ==============================
// ポーリング
// ==============================

setInterval(async () => {

    const res = await getRoomState(
        roomId
    );

    if (
        res === null ||
        res.status !== "ok"
    ) {

        return;
    }

    updatePlayerList(
        res.room.players,
        res.room.host
    );

    // ==============================
    // 開始待ち
    // ==============================

    if (
        res.room.state === "開始待ち"
    ) {

        if (state !== 0) {

            document.getElementById(
                "game"
            ).style.display = "none";

            document.getElementById(
                "select"
            ).style.display = "none";

            document.getElementById(
                "waiting"
            ).style.display = "block";

            document.getElementById(
                "game_text"
            ).innerHTML = "";

            state = 0;

        }

        return;
    }


    // ==============================
    // ゲーム開始済み
    // ==============================

    if (
        state === 0 &&
        res.room.state === "開始済み"
    ) {

        document.getElementById(
            "waiting"
        ).style.display = "none";

        document.getElementById(
            "select"
        ).style.display = "none";

        document.getElementById(
            "game"
        ).style.display = "block";

        const words =
            res.room.game.words;

        const otherWords =
            Object.entries(words)
                .filter(
                    ([name, word]) =>
                        name !== playername
                );

        document.getElementById(
            "game_text"
        ).innerHTML =
            otherWords
                .map(
                    ([name, word]) =>
                        `${name}：${word}`
                )
                .join("<br>");

        state = 1;

    }

}, 1000);

// ==============================
// 条件選択
// ==============================

const conditions = [
    [
        "no_price",
        "特にこのボックスに意味はないです"
    ],
    [
        "other",
        "その他"
    ]
];

const selectBox =
    document.getElementById(
        "condition_select"
    );

const current =
    selectBox.querySelector(
        ".select-current"
    );

const optionsBox =
    selectBox.querySelector(
        ".select-options"
    );

let selectedValue = null;


// 選択肢の生成
conditions.forEach(
    ([value, text]) => {

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.textContent = text;

        button.dataset.value = value;

        button.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "selected-condition"
                ).textContent = text;

                selectedValue = value;

                selectBox.classList.remove(
                    "open"
                );

                console.log(
                    "選択:",
                    selectedValue
                );

            }
        );

        optionsBox.appendChild(
            button
        );

    }
);


// セレクトボックスの開閉
current.addEventListener(
    "click",
    () => {

        selectBox.classList.toggle(
            "open"
        );

    }
);

// ==============================
// DOM読み込み後
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        shokika();

    }
);