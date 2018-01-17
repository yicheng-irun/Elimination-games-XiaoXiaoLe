# Elimination-games-XiaoXiaoLe
A Elimination games based on the HTML,Javascript。Used the createjs framework。

-------------

## -> [view online demo](https://yicheng-irun.github.io/Elimination-games-XiaoXiaoLe/)

--------------

## screenshot:

>Example 1:<br>
![demo1](https://raw.githubusercontent.com/yicheng-irun/Elimination-games-XiaoXiaoLe/master/assets/demo1.png)

>Example "hint()":<br>
![demo1](https://raw.githubusercontent.com/yicheng-irun/Elimination-games-XiaoXiaoLe/master/assets/demo2.png)

>Example [col&row]:<br>
>```Javascript
>{
>    col:20,  //set 20 columns
>    row:16,  //set 16 rows
>}
>```
>![demo1](https://raw.githubusercontent.com/yicheng-irun/Elimination-games-XiaoXiaoLe/master/assets/demo3.png)


## usage:
```HTML
<div class="game-container">
    <canvas id="js-game" width="300" height="250" class="gamecanvas"></canvas>
</div>
<script src="res/zepto.min.1.1.6.js"></script>
<script src="res/easeljs-0.8.2.min.js"></script>
<script src="res/tweenjs-0.6.2.min.js"></script>
<script src="res/hammer.min.js"></script>
<script src="xiaoxiaole.js"></script>
<script>
    var xxl = new XiaoXiaoLe("js-game", "img" ,{
            col:6,  //6 columns
            row:5,  //5 rows
        },
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

    xxl.start();

    // hint 
    xxl.hint();
</script>
```

<br>



<br>
<br>
