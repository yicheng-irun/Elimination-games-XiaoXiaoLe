# Elimination-games-XiaoXiaoLe
Based on the HTML,Javascript elimination games 。Use the createjs framework


## screenshot:

>demo1:<br>
![demo1]("https://github.com/yicheng-irun/Elimination-games-XiaoXiaoLe/raw/trank/assets/demo1.png")




## usage:
```HTML
<div class="game-container">
    <canvas id="js-game-bg" width="300" height="250" class="game-bg-canvas"></canvas>
    <canvas id="js-game" width="300" height="250" class="gamecanvas"></canvas>
</div>

<script>
    var xxl = new XiaoXiaoLe("js-game", "js-game-bg", "img",
        function (score) {  //score changed calback
            $("#js-score-num").text(score)
        }, 
        function (score) {   //game end calback
            alert("gameover!!,You get " + score + " points");
        }, 
        function (time) {
            $("#js-time-down").text(time)
        }
    );
</script>
```
