function XiaoXiaoLe(canvasId, imgspath, options, scorechange, gameendcalback, timedowncalback) {
    var _this = this;
    var w = 600, h = 500, boxsize = 100;
    var wi = 6, hi = 5;
    var classnum = 5;

    wi = options.col || wi;
    hi = options.row || hi;
    boxsize = options.boxsize || boxsize;

    w = wi * boxsize;
    h = hi * boxsize;

    var score = 0;

    var gameend = false;

    var bitimages = {};
    var maps = new Array(5);

    var icocontainer = new createjs.Container();

    var mask;
    var hands, line, handstween, linetween, tishimask;  //手和线  以及对应的动画

    var touching = false;   //必须由panstart开始的pan才有效

    var canxiao = null;

    function preparebackground() {  //绘制背景
        //var bgcanvas = document.getElementById(bgcanvasId)
        //bgcanvas.height = h;
        //bgcanvas.width = w;

        //绘制背景
        var bggrid = new createjs.Shape();
        var bgg = bggrid.graphics.f("#104d50");
        for (var i = 0; i < hi; i++) {
            for (var j = i % 2; j < wi; j += 2) {
                var x = j * boxsize, y = i * boxsize;
                bgg.rect(x, y, boxsize, boxsize);
            }
        }
        bggrid.cache(0,0,w,h)
        this.stage.addChild(bggrid)
        //this.stage.update();
        //bgcanvas.getContext("2d").drawImage(this.canvas, 0, 0, w, h)
        //this.stage.removeChild(bggrid);
    }
    function loadimg() {    //加载图片
        for (var i = 0; i < classnum; i++) {
            bitimages[i] = new createjs.Bitmap(imgspath + "/" + i + ".png");
            //bitimages[i].scaleX = bitimages[i].scaleY = 1;
            bitimages[i].regX = bitimages[i].regY = -8;
        }
    }
    function randomrect() {     //初始化数据
        for (var i = 0; i < hi; i++) {
            for (var j = 0; j < wi; j++) {
                var notin = {};
                if (maps[i - 1] !== undefined && maps[i - 2] !== undefined && maps[i - 1][j].c == maps[i - 2][j].c) {
                    notin[maps[i - 1][j].c] = true;
                }
                if (maps[i][j - 1] !== undefined && maps[i][j - 2] !== undefined && maps[i][j - 1].c == maps[i][j - 2].c) {
                    notin[maps[i][j - 1].c] = true;
                }

                while (true) {
                    var b = Math.floor(Math.random() * classnum);
                    if (!notin[b]) {
                        maps[i][j] = {
                            b: null,    //bitimage
                            c: b,       //类型
                            x: j,       //水平位置
                            y: i,       //垂直位置
                            ax: 0,      //水平遍历加一    最长公共子序算法
                            ay: 0,      //垂直遍历加一    最长公共子序算法
                        };
                        break;
                    }
                }
                var a = maps[i][j].b = bitimages[maps[i][j].c].clone();
                a.x = j * boxsize;
                a.y = i * boxsize;

                icocontainer.addChild(a)
            }
        }
        panduan(true);
    }

    function addScore(num) {
        score += num;
        if (scorechange) {
            scorechange(score);
        }
    }

    function prepareScene() {   //初始化场景
        for (var i = 0; i < hi; i++) {
            maps[i] = new Array(wi);
        }
        randomrect.bind(this)();

        mask = new createjs.Shape();
        mask.graphics.f("rgba(0,0,0,0.75)").r(0, 0, w, h);
        startbtn = new createjs.Container();

        hands = new createjs.Bitmap(imgspath + "/hands.png");
        hands.scaleX = hands.scaleY = 0.8;
        hands.x = hands.y = boxsize / 2;
        hands.regX = hands.regY = 10;
        hands.visible = false;

        line = new createjs.Bitmap(imgspath + "/line.png");
        line.x = line.y = boxsize / 2;
        line.regX = line.regY = 5;
        line.visible = false;

        tishimask = new createjs.Shape();


        this.stage.addChild(mask);
        this.stage.addChild(tishimask);

        this.stage.addChild(line);
        this.stage.addChild(hands);

    }




    var canmove = false;
    function addEvent() {   //添加事件

        var offset;
        var cwidth, cheight;
        var mindistance;

        var $canvas = $(this.canvas);

        var startpoint, endpoint, dirpoint;

        var hmtouch = new Hammer(this.canvas, {});
        hmtouch.on("pan", function (ev) {
            if (!touching || !canmove) {
                return;
            }

            var tpoint = { x: (ev.changedPointers[0].pageX - offset.left) / cwidth * w, y: (ev.changedPointers[0].pageY - offset.top) / cheight * h };
            if (ev.distance > mindistance) {
                //console.log(ev)
                var absx = Math.abs(ev.deltaX);
                var absy = Math.abs(ev.deltaY);
                if (absx > absy && absx / absy > 2) {
                    dirpoint = { x: startpoint.x + (ev.deltaX > 0 ? 1 : -1), y: startpoint.y }

                    //var a = maps[startpoint.y][startpoint.x].b;
                    //a.regX = - ev.deltaX * cwidth / w;
                    //a.regY = - ev.deltaY * cwidth / w;
                } else if (absx < absy && absy / absx > 2) {
                    dirpoint = { x: startpoint.x, y: startpoint.y + (ev.deltaY > 0 ? 1 : -1) }

                    //var a = maps[startpoint.y][startpoint.x].b;
                    //a.regX = - ev.deltaX * cwidth / w;
                    //a.regY = - ev.deltaY * cwidth / w;

                } else {
                    dirpoint = null;
                }
                //console.log(dirpoint)
                if (dirpoint != null) {
                    touching = false;
                    panendfun();
                }

            }

        });
        hmtouch.on('panstart', function (ev) {
            if (gameend || !canmove) {
                return;
            }
            offset = $canvas.offset();
            cwidth = $canvas.width();
            cheight = $canvas.height();
            mindistance = cwidth / w * boxsize / 1.5;
            var tpoint = { x: (ev.changedPointers[0].pageX - offset.left) / cwidth * w, y: (ev.changedPointers[0].pageY - offset.top) / cheight * h };
            startpoint = { x: Math.floor(tpoint.x / boxsize), y: Math.floor(tpoint.y / boxsize) };

            touching = true;
        });

        function panendfun() {//移动一个元素的时候调用

            if (dirpoint != null && maps[dirpoint.y] !== undefined && maps[dirpoint.y][dirpoint.x] !== undefined) {

                canmove = false;

                var sp = startpoint;
                var dp = dirpoint;

                var a = maps[sp.y][sp.x]
                var t = maps[dp.y][dp.x];
                maps[dp.y][dp.x] = a
                maps[sp.y][sp.x] = t;

                createjs.Tween.get(a.b).to({ x: dp.x * boxsize, y: dp.y * boxsize }, 200)
                createjs.Tween.get(t.b).to({ x: sp.x * boxsize, y: sp.y * boxsize }, 200)
                setTimeout(function () {

                    if (!xiaochu()) {

                        maps[dp.y][dp.x] = t
                        maps[sp.y][sp.x] = a;
                        createjs.Tween.get(a.b).to({ x: sp.x * boxsize, y: sp.y * boxsize }, 200)
                        createjs.Tween.get(t.b).to({ x: dp.x * boxsize, y: dp.y * boxsize }, 200)

                        if (!gameend) {
                            canmove = true;
                            panduan();
                        } else {
                            gameendfun();
                        }
                    }

                }, 320);

                dirpoint = null;
            }
            touching = false;
        }

        function xiaochu() {    //消除

            for (var i = 0; i < hi; i++) {
                for (var j = 0; j < wi; j++) {
                    maps[i][j].ax = 1;
                    if (maps[i][j - 1] != undefined && maps[i][j - 1].c == maps[i][j].c) {
                        maps[i][j].ax = maps[i][j - 1].ax + 1;
                        if (maps[i][j].ax >= 3) {
                            for (var h = j - 1; h >= 0; h--) {
                                if (maps[i][h].c == maps[i][j].c) {
                                    maps[i][h].ax = maps[i][j].ax;
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            for (var j = 0; j < wi; j++) {
                for (var i = 0; i < hi; i++) {
                    maps[i][j].ay = 1;
                    if (maps[i - 1] != undefined && maps[i - 1][j].c == maps[i][j].c) {
                        maps[i][j].ay = maps[i - 1][j].ay + 1;
                        if (maps[i][j].ay >= 3) {
                            for (var h = i - 1; h >= 0; h--) {
                                if (maps[h][j].c == maps[i][j].c) {
                                    maps[h][j].ay = maps[i][j].ay;
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            var sum = 0;
            for (var i = 0; i < hi; i++) {
                for (var j = 0; j < wi; j++) {
                    if (maps[i][j].ax >= 3 || maps[i][j].ay >= 3) {
                        sum++;
                        icocontainer.removeChild(maps[i][j].b);
                        maps[i][j] = null;
                    }
                }
            }

            if (sum > 0) {
                addScore(sum)
                buqi();
                return true;
            }

            return false;
        }

        function buqi() {   //补全代码
            if (hands.visible) {
                _this.closeHint();
            }


            var maxcount = 0;
            for (var j = 0; j < wi; j++) {
                var linecount = 0;
                var fallcount = 0;
                for (var i = hi - 1; i >= 0; i--) {
                    if (maps[i][j] == null) {
                        fallcount++;
                        var dk = null;
                        for (var k = i - 1; k >= 0; k--) {
                            if (maps[k][j] != null) {
                                dk = k;
                                break;
                            }
                        }
                        if (dk !== null) {
                            maps[i][j] = maps[k][j];
                            maps[k][j] = null;
                        } else {
                            linecount++;
                            maps[i][j] = {
                                b: null,    //bitimage
                                c: Math.floor(Math.random() * classnum),       //类型
                                x: j,       //水平位置
                                y: i,       //垂直位置
                                ax: 0,      //水平遍历加一    最长公共子序算法
                                ay: 0,      //垂直遍历加一    最长公共子序算法
                            };
                            maps[i][j].b = bitimages[maps[i][j].c].clone();
                            maps[i][j].b.x = j * boxsize;
                            maps[i][j].b.y = -linecount * boxsize;
                            icocontainer.addChild(maps[i][j].b);
                        }
                        createjs.Tween.get(maps[i][j].b).wait(fallcount * 100).to({ y: i * boxsize }, 300, createjs.Ease.quadIn);// x: j * boxsize,
                    }

                }
                if (fallcount > maxcount) {
                    maxcount = fallcount;
                }
            }

            setTimeout(function () {
                if (!xiaochu()) {
                    if (gameend) {
                        gameendfun();
                    } else {
                        canmove = true;
                        panduan();
                    }
                }
            }, 400 + maxcount * 100);
        }


        //hmtouch.on('panend', panendfun);
        hmtouch.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 1 });

    }

    function placeagain(isstart) { //死棋之后的重新洗牌

        var boxsquare = wi * hi;
        for (var k = boxsquare - 1; k >= 0; k--) {   //经典洗牌算法的改版，加上单张牌重抽

            var j = k % wi;
            var i = Math.floor(k / wi);

            if (k > 0) {
                var notin = {};
                if (maps[i + 1] !== undefined && maps[i + 2] !== undefined && maps[i + 1][j].c == maps[i + 2][j].c) {
                    notin[maps[i + 1][j].c] = true;
                }
                if (maps[i][j + 1] !== undefined && maps[i][j + 2] !== undefined && maps[i][j + 1].c == maps[i][j + 2].c) {
                    notin[maps[i][j + 1].c] = true;
                }
                var times = 6;
                while (true) {
                    var shu = Math.floor(Math.random() * (k + 1));
                    var hyu = shu % wi;
                    var hchu = Math.floor(shu / wi);

                    var b = maps[hchu][hyu].c;
                    if (!notin[b]) {

                        var t = maps[i][j];
                        maps[i][j] = maps[hchu][hyu];
                        maps[hchu][hyu] = t;
                        break;
                    } else {
                        times--;
                        if (times <= 0) {
                            placeagain(isstart)
                            return;
                        }
                    }
                }
            } else {
                if (maps[i + 1] !== undefined && maps[i + 2] !== undefined && maps[i + 1][j].c == maps[i + 2][j].c && maps[i + 1][j].c == maps[i][j].c) {
                    placeagain(isstart);
                    return;
                }
                if (maps[i][j + 1] !== undefined && maps[i][j + 2] !== undefined && maps[i][j + 1].c == maps[i][j + 2].c && maps[i][j + 1].c == maps[i][j].c) {
                    placeagain(isstart);
                    return;
                }
            }
        }

        for (var i = 0; i < hi; i++) {
            for (var j = 0; j < wi; j++) {
                if (isstart) {
                    maps[i][j].b.y = i * boxsize;
                    maps[i][j].b.x = j * boxsize;
                } else {
                    createjs.Tween.get(maps[i][j].b).wait(300).to({ y: i * boxsize, x: j * boxsize }, 300);
                }

            }
        }
        if (!isstart) {
            setTimeout(function () {
                if (gameend) {
                    gameendfun();
                } else {
                    canmove = true;
                    panduan();
                }

            }, 600);
        } else {
            panduan(isstart);
        }
    }

    function panduan(isstart) {  //判断是否死棋

        if (!isstart && (gameend || !canmove)) {
            return;
        }

        for (var i = 0; i < hi; i++) {
            for (var j = 0; j < wi; j++) {
                canxiao = isdie(i, j, true)
                if (canxiao != true) {
                    //console.log(i + 1, j + 1);
                    return false;
                }
            }
        }

        canmove = false;
        placeagain(isstart);
    }

    function isdie(y, x, getposition) {  //判断某一点的死棋

        var rx1 = x + 1 < wi;
        var rx2 = x + 2 < wi;
        var rx3 = x + 3 < wi;
        var lx1 = x - 1 >= 0;
        var lx2 = x - 2 >= 0;

        var by1 = y + 1 < hi;
        var by2 = y + 2 < hi;
        var by3 = y + 3 < hi;
        var ty1 = y - 1 >= 0;
        var ty2 = y - 2 >= 0;

        var c = maps[y][x].c;

        if (rx3) {
            if (maps[y][x + 3].c == c && (maps[y][x + 1].c == c || maps[y][x + 2].c == c)) {
                if (getposition) {
                    if (maps[y][x + 1].c == c) {
                        return [y, x, y, x + 3, y, x + 1];
                    } else {
                        return [y, x, y, x + 3, y, x + 2];
                    }
                }
                return false;
            }
        }
        if (rx2 && by1) {
            if (maps[y][x + 1].c == c && maps[y + 1][x + 2].c == c) {
                if (getposition) {
                    return [y, x, y, x + 1, y + 1, x + 2];
                }
                return false;
            }
            if (maps[y + 1][x + 1].c == c) {
                if (maps[y][x + 2].c == c) {
                    if (getposition) {
                        return [y, x, y + 1, x + 1, y, x + 2];
                    }
                    return false;
                }
                if (maps[y + 1][x + 2].c == c) {
                    if (getposition) {
                        return [y, x, y + 1, x + 1, y + 1, x + 2];
                    }
                    return false;
                }
            }
        }

        if (by3) {
            if (maps[y + 3][x].c == c && (maps[y + 1][x].c == c || maps[y + 2][x].c == c)) {
                if (getposition) {
                    if (maps[y + 1][x].c == c) {
                        return [y, x, y + 1, x, y + 3, x];
                    } else {
                        return [y, x, y + 2, x, y + 3, x];
                    }
                }
                return false;
            }
        }
        if (by2 && rx1) {
            if (maps[y + 1][x].c == c && maps[y + 2][x + 1].c == c) {
                if (getposition) {
                    return [y, x, y + 1, x, y + 2, x + 1];
                }
                return false;
            }
            if (maps[y + 1][x + 1].c == c) {
                if (maps[y + 2][x].c == c) {
                    if (getposition) {
                        return [y, x, y + 1, x + 1, y + 2, x];
                    }
                    return false;
                }
                if (maps[y + 2][x + 1].c == c) {
                    if (getposition) {
                        return [y, x, y + 1, x + 1, y + 2, x + 1];
                    }
                    return false;
                }
            }
        }

        if (lx1 && by1 && maps[y + 1][x - 1].c == c) {
            if (lx2 && maps[y + 1][x - 2].c == c) {
                if (getposition) {
                    return [y, x, y + 1, x - 1, y + 1, x - 2];
                }
                return false;
            }
            if (by2 && maps[y + 2][x - 1].c == c) {
                if (getposition) {
                    return [y, x, y + 1, x - 1, y + 2, x - 1];
                }
                return false;
            }
            if (rx1 && maps[y + 1][x + 1].c == c) {
                if (getposition) {
                    return [y, x, y + 1, x - 1, y + 1, x + 1];
                }
                return false;
            }
        }

        if (rx1 && ty1 && maps[y - 1][x + 1].c == c) {
            if (rx2 && maps[y - 1][x + 2].c == c) {
                if (getposition) {
                    return [y, x, y - 1, x + 1, y - 1, x + 2];
                }
                return false;
            }
            if (ty2 && maps[y - 2][x + 1].c == c) {
                if (getposition) {
                    return [y, x, y - 1, x + 1, y - 2, x + 1];
                }
                return false;
            }
            if (by1 && maps[y + 1][x + 1].c == c) {
                if (getposition) {
                    return [y, x, y - 1, x + 1, y + 1, x + 1];
                }
                return false;
            }
        }

        return true;
    }

    function tishi() {  //显示提示手势

        //console.log(canxiao);

        var m1 = 0, m2 = 0;
        canxiao[0] == canxiao[2] ? m1++ : 0;
        canxiao[2] == canxiao[4] ? m1++ : 0;
        canxiao[0] == canxiao[4] ? m1++ : 0;
        canxiao[1] == canxiao[3] ? m2++ : 0;
        canxiao[3] == canxiao[5] ? m2++ : 0;
        canxiao[1] == canxiao[5] ? m2++ : 0;

        //console.log(m1 + " - " + m2);

        var movepos, mubiaopos, pos = [];

        var avg = 0;
        if (m1 == 1 || m2 == 1) {
            if (m1 == 1) {
                avg = Math.round((canxiao[0] + canxiao[2] + canxiao[4]) / 3);
                for (var i = 0; i < 6; i += 2) {
                    if (canxiao[i] == avg) {
                        pos.push({ i: canxiao[i], j: canxiao[i + 1] });
                    } else {
                        movepos = { i: canxiao[i], j: canxiao[i + 1] };
                    }
                }
                mubiaopos = { i: avg, j: movepos.j };
            } else {
                avg = Math.round((canxiao[1] + canxiao[3] + canxiao[5]) / 3);
                for (var i = 1; i < 6; i += 2) {
                    if (canxiao[i] == avg) {
                        pos.push({ i: canxiao[i - 1], j: canxiao[i] });
                    } else {
                        movepos = { i: canxiao[i - 1], j: canxiao[i] };
                    }
                }
                mubiaopos = { i: movepos.i, j: avg };
            }
        } else if (m1 == 3 || m2 == 3) {
            if (m1 == 3) {
                avg = Math.round((canxiao[1] + canxiao[3] + canxiao[5]) / 3);
                for (var i = 1; i < 6; i += 2) {
                    if (canxiao[i] - avg <= 1 && canxiao[i] - avg >= -1) {
                        pos.push({ i: canxiao[i - 1], j: canxiao[i] });
                    } else {
                        movepos = { i: canxiao[i - 1], j: canxiao[i] };
                        mubiaopos = { i: movepos.i, j: Math.round((movepos.j + avg) / 2) };
                    }
                }
            } else {
                avg = Math.round((canxiao[0] + canxiao[2] + canxiao[4]) / 3);
                for (var i = 0; i < 6; i += 2) {
                    if (canxiao[i] - avg <= 1 && canxiao[i] - avg >= -1) {
                        pos.push({ i: canxiao[i], j: canxiao[i + 1] });
                    } else {
                        movepos = { i: canxiao[i], j: canxiao[i + 1] };
                        mubiaopos = { i: Math.round((movepos.i + avg) / 2), j: movepos.j };
                    }
                }
            }
        }

        var data = { y: mubiaopos.i - movepos.i, x: mubiaopos.j - movepos.j };
        if (data.x > 0) {
            line.rotation = 0;
        } else if (data.x < 0) {
            line.rotation = 180;
        } else if (data.y > 0) {
            line.rotation = 90;
        } else {
            line.rotation = 270;
        }

        line.x = hands.x = movepos.j * boxsize + 50;
        line.y = hands.y = movepos.i * boxsize + 50;

        tishimask.graphics.c().f("rgba(0,0,0,0.75)").r(0, 0, w, h).cp().r(movepos.j * boxsize, (movepos.i + 1) * boxsize, boxsize, -boxsize)
            .r(mubiaopos.j * boxsize, (mubiaopos.i + 1) * boxsize, boxsize, -boxsize)
            .r(pos[0].j * boxsize, (pos[0].i + 1) * boxsize, boxsize, -boxsize)
            .r(pos[1].j * boxsize, (pos[1].i + 1) * boxsize, boxsize, -boxsize)

        tishimask.visible = true;
        hands.visible = true;
        line.visible = true;

        handstween = createjs.Tween.get(hands, { loop: true }, null, true).wait(300)
            .to({ x: mubiaopos.j * boxsize + 50, y: mubiaopos.i * boxsize + 50 }, 600)
            .wait(600)
            .to({ x: movepos.j * boxsize + 50, y: movepos.i * boxsize + 50 }, 400, createjs.Ease.quadOut);

        line.scaleX = 0;
        linetween = createjs.Tween.get(line, { loop: true }, null, true).wait(300)
            .to({ scaleX: 1 }, 600).to({ visible: false }, 600)
            .wait(400);

        mask.visible = false;

    }

    function init() {
        this.canvas = document.getElementById(canvasId);
        this.canvas.height = h;
        this.canvas.width = w;
        this.stage = new createjs.Stage(this.canvas);
        this.stage.autoClear = true;

        //绘制完背景
        preparebackground.bind(this)();

        this.stage.addChild(icocontainer);
        loadimg();
        prepareScene.bind(this)();
        addEvent.bind(this)();

        createjs.Ticker.addEventListener("tick", tick);
        createjs.Ticker.setFPS(60);
    }

    init.bind(this)();

    function gameendfun() {
        gameend = true;
        gaming = false;
        touching = false;
        canmove = false;
        mask.visible = true;
        createjs.Tween.get(mask).to({ alpha: 1 }, 300);
        if (gameendcalback) {
            gameendcalback(score);
        }
    }
    var interv = 0;
    var gaming = false;
    var gametimeout = 2;
    gametimeout *= 30;
    var timecount = 0;
    this.start = function () {
        if (gaming) {

        } else {
            score = 0;
            addScore(0);
            canmove = true;
            gaming = true;  //设置游戏真正进行中的标识
            gameend = false;    //设置游戏结束的标识

            //icocontainer.removeAllChildren();
            //randomrect.bind(this)();

            createjs.Tween.get(mask).to({ alpha: 0 }, 100).call(function () {
                mask.visible = false;
            });

            panduan();

            setTimeout(function () {
                gameend = true; //设置游戏结束
                if (canmove) {
                    gameendfun();
                }
            }, (gametimeout + 1) * 1000);
            timecount = gametimeout;
            interv = setInterval(function () {
                timecount--;
                if (timedowncalback) {
                    timedowncalback(timecount);
                }
                if (timecount <= 0) {
                    clearInterval(interv);
                }
            }, 1000);
        }
    }

    this.hint = function () {
        tishi();
    }
    this.closeHint = function () {
        tishimask.visible = false;
        createjs.Tween.removeTweens(hands)
        createjs.Tween.removeTweens(line)
        hands.visible = false;
        line.visible = false;
        if (!gameend) {
            mask.visible = true;
        }
    }


    function tick(event) {
        _this.stage.update();
    }
}