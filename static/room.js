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

document.addEventListener("DOMContentLoaded", function() {
    shokika();
});
