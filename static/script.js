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
function Button1Click(){
    console.log("Button1Click");
    if(state == 0){
        fetch("/api/state")
        .then(response => response.json())
        .then(response => {document.getElementById("Button1Text").innerHTML = Text1list[state] + "<br>" + response.state});
    }

    state += 1;
    if(state > 2){
        shokika();
    }
    
};

document.getElementById("Text1").addEventListener("keydown", function(event) {
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
};

document.addEventListener("DOMContentLoaded", function() {
    shokika();
});

