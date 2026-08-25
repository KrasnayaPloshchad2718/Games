//room.js

async function decision(){
    const re = await registerPlayer(roomId, name);
    if (re.status === "ok"){
        document.getElementById("name").style.display = "none";
        
    }else{
        document.getElementById("name").innerHTML = "名前が重複しています。別の名前を入力してください。";
    }
};

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

async function shokika(){
    const name = sessionStorage.getItem("player_name");
    if(name==null){
        document.getElementById("name").style.display = "block";
    }else{
        document.getElementById("name").style.display = "none";
        const res = await registerPlayer(roomId, name);

            if (res !== null && res.status === "ok") {
                console.log("登録成功");
            }   
    }
    const res = await getRoomState(roomId);
    const host = res.state.host;
    if (host === name){
    const authority = "True";
    }else{
    const authority = "False";
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

setInterval(async () => {
    const res = await getRoomState(roomId);

    if (res !== null) {
        updatePlayerList(res.room.players, res.room.host);
    }
}, 1000);


document.addEventListener("DOMContentLoaded", function() {
    shokika();
});
