window.onload = function() {
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    var initialized = false;
    
    var images = [];
    var tileimage;
    
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;
    
    function loadImages(imagefiles) {

        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;
        

        var loadedimages = [];
        for (var i=0; i<imagefiles.length; i++) {
    
            var image = new Image();
            
    
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
            
                    preloaded = true;
                }
            };
            
    
            image.src = imagefiles[i];
            
    
            loadedimages[i] = image;
        }
        

        return loadedimages;
    }
    
    var Level = function (columns, rows, tilewidth, tileheight) {
        this.columns = columns;
        this.rows = rows;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        

        this.tiles = [];
        for (var i=0; i<this.columns; i++) {
            this.tiles[i] = [];
            for (var j=0; j<this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };
    
    Level.prototype.generate = function() {
        for (var i=0; i<this.columns; i++) {
            for (var j=0; j<this.rows; j++) {
                if (i == 0 || i == this.columns-1 ||
                    j == 0 || j == this.rows-1) {
            
                    this.tiles[i][j] = 1;
                } else {
            
                    this.tiles[i][j] = 0;
                }
            }
        }
    };
    
    
    var Snake = function() {
        this.init(0, 0, 1, 10, 1);
    }
    
    Snake.prototype.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    
    Snake.prototype.init = function(x, y, direction, speed, numsegments) {
        this.x = x;
        this.y = y;
        this.direction = direction
        this.speed = speed;       
        this.movedelay = 0;
        

        this.segments = [];
        this.growsegments = 0;
        for (var i=0; i<numsegments; i++) {
            this.segments.push({x:this.x - i*this.directions[direction][0],
                                y:this.y - i*this.directions[direction][1]});
        }
    }
    
    Snake.prototype.grow = function() {
        this.growsegments++;
    };
    
    Snake.prototype.tryMove = function(dt) {
        this.movedelay += dt;
        var maxmovedelay = 1 / this.speed;
        if (this.movedelay > maxmovedelay) {
            return true;
        }
        return false;
    };
    
    Snake.prototype.nextMove = function() {
        var nextx = this.x + this.directions[this.direction][0];
        var nexty = this.y + this.directions[this.direction][1];
        return {x:nextx, y:nexty};
    }
    
    Snake.prototype.move = function() {

        var nextmove = this.nextMove();
        this.x = nextmove.x;
        this.y = nextmove.y;
    

        var lastseg = this.segments[this.segments.length-1];
        var growx = lastseg.x;
        var growy = lastseg.y;
    

        for (var i=this.segments.length-1; i>=1; i--) {
            this.segments[i].x = this.segments[i-1].x;
            this.segments[i].y = this.segments[i-1].y;
        }
        

        if (this.growsegments > 0) {
            this.segments.push({x:growx, y:growy});
            this.growsegments--;
        }
        

        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        

        this.movedelay = 0;
    }

    var snake = new Snake();
    var level = new Level(52, 15, 32, 32);
    
    var score = 0;            
    var gameover = 1;      
    var gameovertime = 1;     
    var gameoverdelay = 0.5;  
    
    function init() {

        images = loadImages(["public/snake-parts.png"]);
        tileimage = images[0];
    

        canvas.addEventListener("mousedown", onMouseDown);
        

        document.addEventListener("keydown", onKeyDown);
        

        newGame();
        gameover = 1;
    

        main(0);
    }
    
    function tryNewGame() {
        if (gameovertime > gameoverdelay) {
            newGame();
            gameover = false;
        }
    }
    
    function newGame() {

        snake.init(10, 10, 1, 10, 4);
        

        level.generate();
        

        addApple();
        

        score = 0;
        

        gameover = false;
    }
    
    function addApple() {

        var valid = false;
        while (!valid) {
    
            var ax = randRange(0, level.columns-1);
            var ay = randRange(0, level.rows-1);
            
    
            var overlap = false;
            for (var i=0; i<snake.segments.length; i++) {
        
                var sx = snake.segments[i].x;
                var sy = snake.segments[i].y;
                
        
                if (ax == sx && ay == sy) {
                    overlap = true;
                    break;
                }
            }
            
    
            if (!overlap && level.tiles[ax][ay] == 0) {
        
                level.tiles[ax][ay] = 2;
                valid = true;
            }
        }
    }
    
    function main(tframe) {

        window.requestAnimationFrame(main);
        
        if (!initialized) {
    
            
    
            context.clearRect(0, 0, canvas.width, canvas.height);
            
    
            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#ff8080";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#ff8080";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);
            
    
            var loadtext = "Loaded " + loadcount + "/" + loadtotal + " images";
            context.fillStyle = "#000000";
            context.font = "16px Verdana";
            context.fillText(loadtext, 18, 0.5 + canvas.height - 63);
            
            if (preloaded) {
                initialized = true;
            }
        } else {
    
            update(tframe);
            render();
        }
    }
    
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        

        updateFps(dt);
        
        if (!gameover) {
            updateGame(dt);
        } else {
            gameovertime += dt;
        }
    }
    
    function updateGame(dt) {

        if (snake.tryMove(dt)) {
    
            
    
            var nextmove = snake.nextMove();
            var nx = nextmove.x;
            var ny = nextmove.y;
            
            if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
                if (level.tiles[nx][ny] == 1) {
            
                    gameover = 2;
                }
                
        
                for (var i=0; i<snake.segments.length; i++) {
                    var sx = snake.segments[i].x;
                    var sy = snake.segments[i].y;
                    
                    if (nx == sx && ny == sy) {
                
                        gameover = 2;
                        break;
                    }
                }
                
                if (!gameover) {
            

            
                    snake.move();
                    
            
                    if (level.tiles[nx][ny] == 2) {
                
                        level.tiles[nx][ny] = 0;
                        
                
                        addApple();
                        
                        
                        snake.grow();
                        
                
                        score+=10;
                    }
                    

                }
            } else {
        
                gameover = 2;
            }
            
            if (gameover) {
                gameovertime = 0;
                
            }
        }
    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
    
            fps = Math.round(framecount / fpstime);
            
    
            fpstime = 0;
            framecount = 0;
        }
        

        fpstime += dt;
        framecount++;
    }
    
    function render() {

        context.fillStyle = "#577ddb";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        drawLevel();
        drawSnake();
            

        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            
            if(gameover == 2){
             alert("Your score is " + score)
             gameover = 1
             score = 0;
            }
            drawCenterText("Press any key to start!", 0, canvas.height/2, canvas.width);

            

        }
    }
    
    function drawLevel() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
        
                var tile = level.tiles[i][j];
                var tilex = i*level.tilewidth;
                var tiley = j*level.tileheight;
                
        
                if (tile == 0) {
            
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 1) {
            
                    context.fillStyle = "#bcae76";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 2) {
            
                    
            
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                    
            
                    var tx = 0;
                    var ty = 3;
                    var tilew = 64;
                    var tileh = 64;
                    context.drawImage(tileimage, tx*tilew, ty*tileh, tilew, tileh, tilex, tiley, level.tilewidth, level.tileheight);
                }
            }
        }
    }
    
    function drawSnake() {

        for (var i=0; i<snake.segments.length; i++) {
            var segment = snake.segments[i];
            var segx = segment.x;
            var segy = segment.y;
            var tilex = segx*level.tilewidth;
            var tiley = segy*level.tileheight;
            
    
            var tx = 0;
            var ty = 0;
            
            if (i == 0) {
        
                var nseg = snake.segments[i+1]
                if (segy < nseg.y) {
            
                    tx = 3; ty = 0;
                } else if (segx > nseg.x) {
            
                    tx = 4; ty = 0;
                } else if (segy > nseg.y) {
            
                    tx = 4; ty = 1;
                } else if (segx < nseg.x) {
            
                    tx = 3; ty = 1;
                }
            } else if (i == snake.segments.length-1) {
        
                var pseg = snake.segments[i-1]
                if (pseg.y < segy) {
            
                    tx = 3; ty = 2;
                } else if (pseg.x > segx) {
            
                    tx = 4; ty = 2;
                } else if (pseg.y > segy) {
            
                    tx = 4; ty = 3;
                } else if (pseg.x < segx) {
            
                    tx = 3; ty = 3;
                }
            } else {
        
                var pseg = snake.segments[i-1]
                var nseg = snake.segments[i+1]
                if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
            
                    tx = 1; ty = 0;
                } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
            
                    tx = 2; ty = 0;
                } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
            
                    tx = 2; ty = 1;
                } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
            
                    tx = 2; ty = 2;
                } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
            
                    tx = 0; ty = 1;
                } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
            
                    tx = 0; ty = 0;
                }
            }
            
    
            context.drawImage(tileimage, tx*64, ty*64, 64, 64, tilex, tiley,
                              level.tilewidth, level.tileheight);
        }
    }
    
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
    function randRange(low, high) {
        return Math.floor(low + Math.random()*(high-low+1));
    }
    
    function onMouseDown(e) {

        var pos = getMousePos(canvas, e);
        
        if (gameover) {
    
            tryNewGame();
        } else {
    
            snake.direction = (snake.direction + 1) % snake.directions.length;
        }
    }
    
    function onKeyDown(e) {
        if (gameover) {
            tryNewGame();
        } else {
            if (e.keyCode == 37 || e.keyCode == 65) {
        
                if (snake.direction != 1)  {
                    snake.direction = 3;
                }
            } else if (e.keyCode == 38 || e.keyCode == 87) {
        
                if (snake.direction != 2)  {
                    snake.direction = 0;
                }
            } else if (e.keyCode == 39 || e.keyCode == 68) {
        
                if (snake.direction != 3)  {
                    snake.direction = 1;
                }
            } else if (e.keyCode == 40 || e.keyCode == 83) {
        
                if (snake.direction != 0)  {
                    snake.direction = 2;
                }
            }
            
    
            if (e.keyCode == 32) {
                snake.grow();
            }
        }
    }
    
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    init();
};