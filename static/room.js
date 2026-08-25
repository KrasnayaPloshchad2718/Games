let authority = false;
let playername = "";

let hostToken = sessionStorage.getItem("host_token");
let playerToken = sessionStorage.getItem("player_token");

let state = 0;
let reloadHandled = false;


// ==============================
// 名前決定
// ==============================

async function decision() {

    playername =
        document.getElementById("name_input").value.trim();

    if (!playername) {
        return;
    }

    const result =
        await registerPlayer(roomId, playername);

    if (result && result.status === "ok") {

        sessionStorage.setItem(
            "player_name",
            playername
        );

        sessionStorage.setItem(
            "player_token",
            result.player_token
        );

        authority = false;

        showWaiting();

    } else {

        document.getElementById("name").innerHTML =
            "名前が重複しています。別の名前を入力してください。";
    }
}


// ==============================
// 待機画面
// ==============================

function showWaiting() {

    document.getElementById("name").style.display =
        "none";

    document.getElementById("waiting").style.display =
        "block";

    document.getElementById("game").style.display =
        "none";

    document.getElementById("select").style.display =
        "none";

    if (authority) {

        document.getElementById("game-select").style.display =
            "block";

        document.getElementById("start_button").style.display =
            "block";

    } else {

        document.getElementById("game-select").style.display =
            "none";

        document.getElementById("start_button").style.display =
            "none";
    }
}


// ==============================
// ゲーム開始
// ==============================

async function startGame() {

    if (!authority) {
        return;
    }

    try {

        const response = await fetch("/api/start", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                room_id: roomId,
                host_token: hostToken
            })
        });

        const data = await response.json();

        console.log("開始結果:", data);

        if (data.status === "ok") {

            showGame();

        } else {

            console.error(data.text);
        }

    } catch (error) {

        console.error("通信エラー:", error);
    }
}


// ==============================
// ゲーム画面
// ==============================

function showGame() {

    document.getElementById("waiting").style.display =
        "none";

    document.getElementById("game").style.display =
        "block";

    document.getElementById("select").style.display =
        "none";

    displayWords();
}


// ==============================
// NGワード表示
// ==============================

function displayWords() {

    getRoomState(roomId).then(res => {

        if (!res || !res.room) {
            return;
        }

        const words = res.room.game.words;

        const otherWords =
            Object.entries(words)
                .filter(([name, word]) =>
                    name !== playername
                );

        document.getElementById("game_text").innerHTML =
            otherWords
                .map(([name, word]) =>
                    `${name}：${word}`
                )
                .join("<br>");
    });
}


// ==============================
// ゲーム終了
// ==============================

async function endGame() {

    if (!authority) {
        return;
    }

    try {

        const response = await fetch("/api/end", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                room_id: roomId,
                host_token: hostToken
            })
        });

        const data = await response.json();

        if (data.status === "ok") {

            document.getElementById("game").style.display =
                "none";

            document.getElementById("select").style.display =
                "block";
        }

    } catch (error) {

        console.error("通信エラー:", error);
    }
}


// ==============================
// 継続
// ==============================

async function continueGame() {

    if (!authority) {
        return;
    }

    try {

        const response = await fetch("/api/continue", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                room_id: roomId,
                host_token: hostToken
            })
        });

        const data = await response.json();

        if (data.status === "ok") {

            /*
             * サーバー側で
             *
             * round += 1
             *
             * が行われている。
             *
             * 全員をリロードさせる。
             */

            location.reload();
        }

    } catch (error) {

        console.error("通信エラー:", error);
    }
}


// ==============================
// 終了
// ==============================

function finishGame() {

    document.getElementById("select").style.display =
        "none";

    document.getElementById("game").style.display =
        "none";

    document.getElementById("waiting").style.display =
        "block";
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
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    room_id: roomId
                }),

                cache: "no-cache"
            }
        );

        return await response.json();

    } catch (error) {

        console.error(
            "通信エラー:",
            error
        );

        return null;
    }
}


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
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    room_id: roomId,
                    name: name
                })
            }
        );

        const data =
            await response.json();

        console.log(
            "登録結果:",
            data
        );

        return data;

    } catch (error) {

        console.error(
            "通信エラー:",
            error
        );

        return null;
    }
}


// ==============================
// 再接続
// ==============================

async function reconnect() {

    if (!playerToken && !hostToken) {
        return false;
    }

    const token =
        hostToken || playerToken;

    try {

        const response =
            await fetch(
                "/api/room/reconnect",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        room_id: roomId,
                        player_token: token
                    })
                }
            );

        const data =
            await response.json();

        if (data.status !== "ok") {
            return false;
        }

        playername = data.name;

        if (data.role === "host") {
            authority = true;
        } else {
            authority = false;
        }

        document.getElementById(
            "player_name"
        ).textContent = playername;

        return true;

    } catch (error) {

        console.error(
            "再接続エラー:",
            error
        );

        return false;
    }
}


// ==============================
// プレイヤー一覧
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

        li.className =
            "player";

        if (name === host) {

            li.textContent =
                "★ " +
                name +
                "（ホスト）";

        } else {

            li.textContent =
                name;
        }

        list.appendChild(li);
    });
}


// ==============================
// サーバーからのリロード要求
// ==============================

async function checkReload(room) {

    if (!room.reload) {
        return;
    }

    if (reloadHandled) {
        return;
    }

    reloadHandled = true;

    /*
     * リロードする前にサーバーへ通知
     */

    try {

        await fetch(
            "/api/reload_done",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    room_id: roomId
                })
            }
        );

    } catch (error) {

        console.error(error);
    }

    location.reload();
}


// ==============================
// 状態監視
// ==============================

const roomInterval =
    setInterval(async () => {

        const res =
            await getRoomState(roomId);

        if (!res || !res.room) {
            return;
        }

        updatePlayerList(
            res.room.players,
            res.room.host
        );

        // 継続時のリロード
        await checkReload(res.room);

        // ゲーム開始
        if (
            state === 0 &&
            res.room.state === "開始済み"
        ) {

            showGame();

            state = 1;
        }

        // 終了確認
        if (
            res.room.state === "終了確認"
        ) {

            document.getElementById(
                "game"
            ).style.display = "none";

            /*
             * ホストだけ選択画面を表示
             */

            if (authority) {

                document.getElementById(
                    "select"
                ).style.display = "block";
            }
        }

    }, 1000);


// ==============================
// ゲーム条件選択
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
        "game-select"
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


conditions.forEach(
    ([value, text]) => {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.textContent =
            text;

        button.dataset.value =
            value;

        button.addEventListener(
            "click",
            () => {

                current.childNodes[0]
                    .textContent = text;

                selectedValue =
                    value;

                selectBox.classList
                    .remove("open");

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


current.addEventListener(
    "click",
    () => {

        selectBox.classList.toggle(
            "open"
        );
    }
);


// ==============================
// 初期化
// ==============================

async function shokika() {

    /*
     * まず既存トークンで再接続を試す
     */

    const reconnected =
        await reconnect();

    if (reconnected) {

        /*
         * 再読み込み後なので
         * 名前入力を完全に飛ばす
         */

        showWaiting();

        return;
    }


    /*
     * 初回アクセス
     */

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
}


document.addEventListener(
    "DOMContentLoaded",
    () => {
        shokika();
    }
);