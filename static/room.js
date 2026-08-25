async function decision() {
    const re = await registerPlayer(roomId, name);

    if (re !== null && re.status === "ok") {
        sessionStorage.setItem("player_name", name);

        document.getElementById("name").style.display = "none";
    } else if (re !== null && re.status === 409) {
        document.getElementById("name").innerHTML =
            "名前が重複しています。別の名前を入力してください。";
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

    } catch (error) {
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

        console.log("登録結果:", data);

        // HTTPステータスも結果に入れる
        data.http_status = response.status;

        // player_name が存在するときだけ変更
        const playerNameElement =
            document.getElementById("player_name");

        if (playerNameElement) {
            playerNameElement.innerHTML = name;
        }

        return data;

    } catch (error) {
        console.error("通信エラー:", error);
        return null;
    }
}


async function shokika() {

    const name = sessionStorage.getItem("player_name");

    /*
     * 既に名前を保存している場合
     * → ここでは再登録しない
     */
    if (name === null) {

        document.getElementById("name").style.display = "block";

    } else {

        document.getElementById("name").style.display = "none";

        console.log("既存プレイヤー:", name);
    }


    const res = await getRoomState(roomId);

    // 通信失敗
    if (res === null) {
        console.error("RoomStateを取得できませんでした");
        return;
    }

    // room が存在しない
    if (res.room === undefined) {
        console.error("RoomStateにroomがありません:", res);
        return;
    }

    const host = res.room.host;

    const authority = host === name;

    console.log("host:", host);
    console.log("name:", name);
    console.log("authority:", authority);
}


function updatePlayerList(players, host) {

    const list = document.getElementById("player_list");

    if (!list) {
        console.error("player_list が見つかりません");
        return;
    }

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


setInterval(async () => {

    const res = await getRoomState(roomId);

    if (
        res !== null &&
        res.room !== undefined
    ) {
        updatePlayerList(
            res.room.players,
            res.room.host
        );
    }

}, 1000);


document.addEventListener("DOMContentLoaded", function () {
    shokika();
});