//room.js

let authority = "False"
let playername = "";
async function decision(){
    const res = await getRoomState(roomId);
    playername = document.getElementById("name_input").value;
    const re = await registerPlayer(roomId, name);
    if (re.status === "ok"){
        document.getElementById("name").style.display = "none";
        document.getElementById("waiting").style.display = "block";
        document.getElementById("game-select").style.display = "none";
        document.getElementById("start_button").style.display = "none";
    }else{
        document.getElementById("name").innerHTML = "名前が重複しています。別の名前を入力してください。";
    }
};

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

async function shokika(){
    const name = sessionStorage.getItem("player_name");
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

setInterval(async () => {
    const res = await getRoomState(roomId);

    if (res !== null) {
        updatePlayerList(res.room.players, res.room.host);
        if (playername !== res.room.host){
        if (re.room.state === "開始済み"){
            document.getElementById("waiting").style.display = "none";
            document.getElementById("game").styale.display = "block";

        }
        }
            
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
