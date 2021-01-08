/*  Various functions

    This part gather various functions which will be usefull in the rest of the code
*/

function positivMod(n, mod) {
    // classic n%mod operator gives a negative number when n < 0. This function give a positive modulo in such cases .
    return (n%mod+mod)%mod;
}


/*  Objects

    We oragnize the game in 3 principals classes : 
    - grid
    - snake
    - game
    which will be presented next. The class grid will represent the place where the game take place, the class snake, the snake. 
    Game is the set of a grid, a snake, and from various sprites, sound and parameter usefull for is
*/

    /*  Grid classes

        A grid the the data of three elements : 
         - its _dimensions : 2-array of number [column, row] (or [absciss, ordinate]). Be carrefull, first row (columns) is 0. In this release of 
            the game, column numer = row number ; Remark that a grid is an element of Z/nZ x Z/mZ which mean that id the snake reach a wall, 
            it cross it and its next position is on the front wall.
         - its _applePosition : which is the position ([column, row]) of the apple the snake must eat ;
         - its _freeGrid : which will use to optimise apple position choice. This choice is random, and could fall on a 
            position occupied by the snake. To avoid to repeat the process, at each step of the game, we update free positions in the 
            grid in the free grid. More precisely, each time the snake move, it's set of position change only in maximum
            two points. Thus each time snake move, we remove in _freeGrid a position (new head position), 
            and if the snake don't eat the apple, we add a new free position (tail position). The free grid has a tree structure,
            so those operations a linear and vrey fast. Finaly, to chosse an apple position, one just have to select a random entry in freeGrid
            _freeGrid is an intance of the class freeGrid defined below
            Update : even id the snake is very big, it's seems that choosing randomly position until we find a free position
            is very fast, but i still keep the solution that i find interesting.
    */

class freeGrid {
    /* Class free grid */
    constructor(dimensions) {
        /* the data structure is the sructure of tree. We construct it as an array of array. Let A be a subArray of the array
        the first entry represent the first coordinate of the position in the grid, and the second is an other array which gives the second 
        coordinate link to the first. For example, if A = [2, [2,4,5]], is means that coordinates (2,2), (2,4) and (2,5) are free.
        Function are construct to be sur that a coordinate is reprenting only once in the structure. */
        let yTree = [];
        for (let k = 0; k < dimensions[1]; k++) {
            yTree.push(k)
        }
        this._freeGrid = [] ;
        for (let k = 0; k < dimensions[0]; k++) {
            this._freeGrid.push([k,yTree.slice()])
        }
    }

    /* getters and setters */

    get freeGrid() {
        return this._freeGrid;
    }

    /* functions to add and remove a corrdinate in the free grid */

    findXCoordinate(xCoordinate) {
        /* find index of the columns number (absciss) : it loop on the freeGrid size, so, there is at most (size of the freeFrid) 
        operations */
        let xCpt = 0;

        while (xCpt < this.freeGrid.length && xCoordinate !== this.freeGrid[xCpt][0]) {
            xCpt++;
        } 

        if(xCpt === this.freeGrid.length) {
            return [];
        } else {
            return([xCpt]) ;
        }

    }

    findCoordinates(coordinates) {
        /*  Let be a position, return two numbers such that freeGrid[a][b] = position. First we loop on the freeGrid to
            find the absciss, then we loop on the array of the absciss to find the ordinate. Thus, there is at most 
            2*(size of the freeFrid) operations */
        let yCpt = 0;

        let xCoordinate = this.findXCoordinate(coordinates[0])

        if(xCoordinate.length === 0) {
            return [];
        } else {
            while (yCpt < this.freeGrid[xCoordinate[0]][1].length && coordinates[1] != this.freeGrid[xCoordinate[0]][1][yCpt]) {
                yCpt++;
            }

            if(yCpt === this.freeGrid[xCoordinate[0]][1].length) {
                return xCoordinate;

            }
            else {
                xCoordinate.push(yCpt)
                return xCoordinate;
            }
        }
    }

    removeFreeCoordinates(coordinates) {
        /* given a coordinate, remove it from freeGrid */
        let index = this.findCoordinates(coordinates) ;

        if (index.length == 2) {
            this.freeGrid[index[0]][1].splice(index[1], 1) ;
            if (this.freeGrid[index[0]][1].length === 0) {
                this.freeGrid.splice(index[0], 1) ;
            }
        }

    }

    addFreeCoordinates(coordinates) {
        /* given a coordinate, add it from freeGrid */
        let index = this.findCoordinates(coordinates) ;

        if(index.length !== 2) {
            if(index.length == 0) {
                this.freeGrid.push([coordinates[0], [coordinates[1]]]) ;
            } else {
                this.freeGrid[index[0]][1].push(coordinates[1]) ;
            }
        }

    }

    chooseRandomFreeCoordinates() {
        /*  In the free grid, choose a random corrdinate : one just have to choose randomly a absciss among those in free grid
            then an ordinate link to this absciss */
        let xRand = Math.floor(Math.random() * this.freeGrid.length);
        let yRand = Math.floor(Math.random() * this.freeGrid[xRand][1].length);
        return [this.freeGrid[xRand][0],this.freeGrid[xRand][1][yRand]] ;
    }

}


class grid extends freeGrid {
    constructor(dimensions, applePosition) {
        /*  all position = [absciss, ordinate]? More over, if a grid has dimension n,m, absisses corrdinates will be
            index from 0 to n-1 and ordinates from 0 to m-1. If fact the grid is a Z/nZ x Z/mZ grid 
            a grid is herit of a subgrid : that avoid us to rewrite some methodes.*/

        super(dimensions) ;
        this._dimensions = dimensions ;
        this._applePosition = applePosition ;
    }

    /* getters and setters */

    get dimensions() {
        return this._dimensions ;
    }

    get applePosition() {
        return this._applePosition ;
    }

    set dimensions(dimensions) {
        this._dimensions = dimensions ;
    }

    set applePosition(size) {
        this._applePosition = size ;
    }

    /*  methodes */

    isAnApple(position) {
        /*  indicates if a position [absciss, row] is the position of an apple. Usefull beacuse there is no good comparision
            of array in js */
        return position[0] === this.applePosition[0] && position[1] === this.applePosition[1];
    }


}

    /*  Snake object 
    
        A snake is composed of following attributes : 
         - _direction : (N)ord, (S)outh, (E)ast, (W)est
         - _stepDirection : _direction at step t of the game, it won't move and give the position of the snake 
            at the begining of the step. I use it to avoid the gamer to choose the opposit direction (which is gameOver and 
            easy to do whith pression) : if _stepDirection = N, user can't press on S during the step. 
            Using only the actual _direction is not enough because if the gamer is fast enough, it 
            could do for example N -> E -> S inside the same step, and thus have a move N -> S.
         - _position : it's an array of [absiss, ordinate], first element is the tail, last elemnt is the head of the snake
         - _isDead : indicate to the game if it's game over : isDead become true when the snake crash on himself
         - _ateAnApple : indicate if the snake ate an apple at the step : it is a trigger for special animation and sound
            in this case.
         - _diffAfterMove : when the snake move, only it's first and last position will change (and not always the first if 
            tge snake eats an apple). Thus, when we wan't to add or remove position in free grid, we just have to do it for
            2 positions, and not the whole snake. And when animating, we don't need to redraw the snake completly, just
            modify two positions. It seems very important in the last usecase because to draw a snake, I think that wee need to 
            loop on each position and draw them (as a png image) one by one which is very slow when the snake is big, while the game
            should be fast.
    */


class snake {
    /* constructor */
    constructor(direction, position) {
        // all position = [absciss, ordinate]? More over, if a grid has dimension n,m, absisses corrdinates will be
        // index from 0 to n-1 and ordinates from 0 to m-1. If fact the grid is a Z/nZ x Z/mZ grid
        this._direction = direction ;
        this._stepDirection = direction;
        this._position = position ;
        this._isDead = false ;
        this._ateAnApple = false ;
        this._diffAfterMove = {toDraw:position[0], toErase:[]};
    }

    /* getters and setters */

    get direction() {
        return this._direction ;
    }

    get position() {
        return this._position ;
    }

    get isDead() {
        return this._isDead
    }

    get diffAfterMove() {
        return this._diffAfterMove
    }

    get ateAnApple() {
        return this._ateAnApple ;
    }

    getHeadPosition() {
        return(this._position[this._position.length-1])
    }

    set direction(direction) {
        this._direction = direction;
    }

    set position(position) {
        this._position = position;
    }

    set isDead(isDead) {
        this._isDead = isDead ;
    }

    set diffAfterMove(diffAfterMove) {
        this._diffAfterMove = diffAfterMove ;
    }

    set ateAnApple(ateAnApple) {
        this._ateAnApple = ateAnApple
    }

    /* Various */

    copySnakePosition() {
        /* copy by value of the snake position */
        let copy = [];
    
        this.position.forEach(cell => {
            copy.push(cell.slice()) ;
        }) ;
        return(copy) ;
    }

    /* Moving function */

    nextHeadPosition(gridInstance) {
        /*  At step t, give the position of the head of the snake (last entry of position) at t+1.
            gridInstance is an instance of the grid. Remark that the grid has no wall, when we cross the wall
            the snake appear to the other side */
        let nextHeadPosition ;
        let headPosition = this.getHeadPosition().slice();

        switch(this.direction) {
            case 'N':
                nextHeadPosition = [headPosition[0], positivMod(headPosition[1] + 1, gridInstance.dimensions[1])] ;
                break;
            case 'S':
                nextHeadPosition = [headPosition[0], positivMod(headPosition[1] - 1, gridInstance.dimensions[1])] ;
                break;
            case 'E':
                nextHeadPosition = [positivMod(headPosition[0] + 1, gridInstance.dimensions[0]), headPosition[1]] ;
                break ;
            case 'W':
                nextHeadPosition = [positivMod(headPosition[0] - 1, gridInstance.dimensions[0]), headPosition[1]] ;
                break ;
            default:
                nextHeadPosition = headPosition ;
        }

        return nextHeadPosition
    }

    static willCrashed(nextPosition) {
        /* indicate in the snake will crash into himself using nextPosition */
        let cpt = 0 ;
        let headPosition = nextPosition[nextPosition.length-1] ;

        nextPosition.slice(0, nextPosition.length-1).forEach(part => {
            if (part[0] === headPosition[0] && part[1] === headPosition[1]) {
                cpt++;
            }
        });
        return cpt > 0;
    }

    move(gridInstance) {
        /* update snake giving him his new _position after a move */
        let nextHeadPosition = this.nextHeadPosition(gridInstance) ;
        let nextPosition = this.copySnakePosition() ;

        if (!this.isDead) {
            // if snake id dead, nothin happen anymore
            this.diffAfterMove.toDraw = nextHeadPosition ;
            gridInstance.removeFreeCoordinates(nextHeadPosition) ;

            // first, we compute potential snake position
            if (gridInstance.isAnApple(nextHeadPosition)) {
                this.ateAnApple = true ;
                this.diffAfterMove.toErase = [] ;
                nextPosition.push(nextHeadPosition) ;
                gridInstance.applePosition = gridInstance.chooseRandomFreeCoordinates() ;
            } else {
                this.ateAnApple = false ;
                this.diffAfterMove.toErase = nextPosition[0] ;       
                gridInstance.addFreeCoordinates(nextPosition[0]) ;
                nextPosition.push(nextHeadPosition) ;
                nextPosition.shift() ; 
            }
    
            // if it's not a crash, we update snake attributes
            if (snake.willCrashed(nextPosition, gridInstance)) {
                this.isDead = true ;
                this.diffAfterMove.toDraw = this.position[this.position.length-1] ;
                this.diffAfterMove.toErase = [] ;  
            } else {
                this.position = nextPosition ;
            }

            this.stepDirection = this.direction;

        }

    }
}

/*  Class game

    Class game consist in three king of object :
    - _grid and _snake object
    - game parameters which are : 
        - _stepSpeed : it is the frame rate a a step of the game, each time the sanke eat an apple, it accelerate
        - _minSpeed and _maxSpeed : the maximum and minimum speed of the game. Maybe in a next version, the gamer will be able to
        choose these parameters
        - _nbCells : the size of the grid
        - interval : it will be computed by a setTimeout function and is usefull to pause the game for example
    - graphical and sound attributes :
        - unity : it is the size of a cells : computed to have a good confort on ecery support (i hope)
        - snake sprite : a png which is used to draw each element of the snake
        - _appleSrite and _appleSpriteChoice : an object of sprite for apple. _appleSpriteChoice is choose randomly
            and is used to choose and _appleSprite
        - _sound : an object of sound. Currently sounds for when the snake eat an apple, and sounds for game over. Remark
            that sound apple is duplicate, it's beacuse the methode play() is called for and object then called again for 
            the same object before it finished, the second play don't launch. It is a problem, if the snake eat two apple in 
            few time. Here with 4 sounds, we ca alternate. eatAppleChoice is used to choose one of the copy.


*/

class game {
    constructor(nbCells, minSpeed, maxSpeed, snakeDirection) {
        let gridDimension = [nbCells,nbCells] ;
        let snakePosition = [Math.floor(gridDimension[0]/2), Math.floor(gridDimension[1]/2)] ;

        /* grid and snake attributes */
        this._snake = new snake(snakeDirection, [snakePosition]) ;
        this._grid = new grid(gridDimension, [0,0]) ;
        this._grid.removeFreeCoordinates(snakePosition) ;
        this._grid.applePosition = this._grid.chooseRandomFreeCoordinates() ;

        /* game parameters attributes */
        this._stepSpeed = minSpeed;
        this._maxSpeed = maxSpeed;
        this._minSpeed = minSpeed;
        this._nbCells = nbCells;
        this._interval = [] ;

        /* graphical and sound attributes */
        this._unity = 0;
        this._snakeSprite = {
            left: document.getElementById("snake-left"),
            right: document.getElementById("snake-right"),
            up: document.getElementById("snake-up"),
            down: document.getElementById("snake-down")
        } ;
        this._appleSpriteChoice = 1 ;
        this._appleSprite = {
            boss1: document.getElementById("boss-1"),
            boss2: document.getElementById("boss-2"),
            boss3: document.getElementById("boss-3")
        } ;
        this._sound = {gameOver: document.getElementById('gameOverSound'), 
            eatApple: [document.getElementById('eatAppleSound'), document.getElementById('eatAppleSound2'),document.getElementById('eatAppleSound3'),document.getElementById('eatAppleSound4')], 
            eatAppleChoice: 0
            };

    }

    newGame(snakeDirection) {
        /* Put attributes in inital position when the player wants to start again a game */
        let gridDimension = [this.nbCells,this.nbCells] ;
        let snakePosition = [Math.floor(gridDimension[0]/2), Math.floor(gridDimension[1]/2)] ;
        this.snake = new snake(snakeDirection, [snakePosition]) ;
        this.grid = new grid(gridDimension, [0,0]) ;
        this.grid.removeFreeCoordinates(snakePosition) ;
        this.grid.applePosition = this.grid.chooseRandomFreeCoordinates() ;
        this.stepSpeed = this.minSpeed;
        this.interval = [] ;
    }

    /* getters and setters */

    get grid() {
        return this._grid ;
    }

    get snake() {
        return this._snake ;
    }

    get stepSpeed() {
        return this._stepSpeed;
    }

    get maxSpeed() {
        return this._maxSpeed ;
    }

    get minSpeed() {
        return this._minSpeed ;
    }

    get nbCells() {
        return this._nbCells ;
    }

    get interval() {
        return this._interval ;
    }

    get snakeSprite() {
        return this._snakeSprite ;
    }

    get appleSpriteChoice() {
        return this._appleSpriteChoice ;
    }

    get appleSprite() {
        return this._appleSprite ;
    }

    get unity() {
        return this._unity ;
    }

    get sound() {
        return this._sound ;
    }

    set maxSpeed(maxSpeed) {
        this._maxSpeed = maxSpeed ;
    }

    set minSpeed(minSpeed) {
        this._minSpeed = minSpeed ;
    }

    set nbCells(nbCells) {
        this._nbCells = nbCells ;
    }

    set interval(interval) {
        this._interval = interval ;
    }

    set stepSpeed(stepSpeed) {
        this._stepSpeed = stepSpeed;
    }

    set unity(unity) {
        this._unity = unity ;
    }

    set appleSpriteChoice(appleSpriteChoice) {
        this._appleSpriteChoice = appleSpriteChoice ;
    }

    set snake(snake) {
        this._snake = snake ;
    }

    set grid(grid) {
        this._grid = grid ;
    }

    /*  Progress of the game */

    setExecution() {
        /* One step on the game (without draw), the function is called via a setTimeout function : thus there is not need of loop. No draw here
        drawing a step in in method drawGameStep */
        this.snake.move(this.grid);
        
        if (this.snake.ateAnApple) {
            if(this.stepSpeed > this.maxSpeed) {
                this.stepSpeed -= (this.stepSpeed-this.maxSpeed)/((this.nbCells/4) ** 2)
                // if the snake eat an apple, the game accelerate
            };
        }

        if (this.snake.isDead) {
            gameOver() ;
        } 
    }

    
    drawGameStep(ctx) {
        /* plot a step of the game. the function is called via a setTimeout function : thus there is not need of loop. remark
        we only fraw new head position or new tail position, but we don't redraw the snake completely each time which is time consuming.
        On the other hand, we redraw the apple each time (only one position, it is fast) */
        let absciss ;
        let ordinate ;

        if (!this.snake.isDead) {
            // if snake is dead, nothing happen again
            if(this.snake.diffAfterMove.toDraw.length > 0) {
                // if something to draw (probably useless precaution, because there should always be a next position head if
                //the snake is not dead)
                if(this.snake.diffAfterMove.toErase.length > 0) {
                    // if something to erase because the snake didn't eat an apple, rease it
                    ordinate= (this.grid.dimensions[1] - this.snake.diffAfterMove.toErase[1]-1)*this.unity ;
                    absciss = (this.snake.diffAfterMove.toErase[0])*this.unity ;
                    ctx.beginPath();
                    ctx.clearRect(absciss, ordinate,this.unity, this.unity) ;
                } else {
                    if (this.snake.ateAnApple) {
                        this.sound.eatApple[this.sound.eatAppleChoice].play() ; 
                        // if the snake eat an apple, lanch the associated sound
                        this.sound.eatAppleChoice = (this.sound.eatAppleChoice+1)%4;
                        // choose a new copy of the sound
                        this.appleSpriteChoice = Math.floor(Math.random() * 3) +1;
                        // if snake eats an apple, choose randomly another sprite
                    }
                }

                ordinate= (this.grid.dimensions[1] - this.snake.diffAfterMove.toDraw[1]-1)*this.unity ;
                absciss = (this.snake.diffAfterMove.toDraw[0])*this.unity ;
                ctx.beginPath();
                ctx.clearRect(absciss, ordinate,this.unity, this.unity) ;
                let image = this.snakeSpriteAccordingDirection() ;
                let imageHeight = this.unity;
                let imageWidth = image.width/image.height*imageHeight
                absciss += (this.unity - imageWidth)/2;
                ctx.drawImage(image,absciss, ordinate,imageWidth, imageHeight);
                ; 
        
            } 
        

            // draw the apple
            ordinate= (this.grid.dimensions[1] - this.grid.applePosition[1]-1)*this.unity ;
            absciss = (this.grid.applePosition[0])*this.unity ;
            ctx.beginPath();
            let image = this.chooseAppleSprite() ;
                // choose the sprite
            let imageHeight = this.unity;
            let imageWidth = image.width/image.height*imageHeight
            absciss += (this.unity - imageWidth)/2;
            ctx.drawImage(image,absciss, ordinate,imageWidth, imageHeight);
        } 
    
        document.getElementById("score-value").innerHTML = this.snake.position.length;
        document.getElementById("speed").innerHTML = Math.floor(10000/this.stepSpeed)/10 + " fps" ;
    
    }


    /* Graphical methods */

    updateGridSize(ctx) {
        /* draw the grid game with the good dimension. It windows width > windows height *0.8, width and height grid (which 
            is square with our game parameters) is windows height *0.8 and so user interface id 0.2*windows height. else, it is
            window width   */
        let documentDimension={width:document.body.clientWidth, height:document.body.clientHeight } ;
        this.unity = Math.min(documentDimension.width, documentDimension.height*0.8)/this.nbCells ;
        document.getElementById("game-interface").style.width = this.nbCells*this.unity+"px";

        ctx.canvas.width  = this.nbCells*this.unity;
        ctx.canvas.height = this.nbCells*this.unity;
    
    }

    snakeSpriteAccordingDirection() {
        /* snake sprite is solid snake . one change the sprite according the di drection of the snake. */
        let sprite ; 
        switch(this.snake.direction) {
            case 'N':
                sprite = this.snakeSprite.up ;
                break;
            case 'S':
                sprite = this.snakeSprite.down ;
                break;
            case 'E':
                sprite = this.snakeSprite.right ;
                break;
            case 'W':
                sprite = this.snakeSprite.left ;
                break;
        }
    
        return sprite ;
    }

    chooseAppleSprite() {
        /* choose random apple sprite */
        let sprite ;
        switch(this.appleSpriteChoice) {
            case 1:
                sprite = this.appleSprite.boss1 ;
                break ;
            case 2:
                sprite = this.appleSprite.boss2 ;
                break ;
            case 3:
                sprite = this.appleSprite.boss3 ;
                break ;
        }
    
        return sprite;
    }



}

/*  User interaction 

    This part gather all the function using for user interaction (press button, press keyboard key to whange snake sirection etc.)
*/

const buttonSwitch = {newGame: false, start: false, pause: false} ;
    /* there si three buttons. Pressing some of them will stop effetc of the others : for example, if i press start once, repressing 
    start has no effect anymore. The object buttonRules will be used to implement thoses rules. False mean non press, true mean press  */

function changeButtonColorNewGame(isSwitch)  {
    if (isSwitch) {
        document.getElementById("new-game-button").style.backgroundColor = "rgb(39, 79, 75)"
    } else {
        document.getElementById("new-game-button").style.backgroundColor = "#03FB8D"
        //#03FB8D
    }
}

function changeButtonColorStart(isSwitch) {
    if (isSwitch) {
        document.getElementById("start-game-button").style.backgroundColor = "rgb(39, 79, 75)"
    } else {
        document.getElementById("start-game-button").style.backgroundColor = "#03FB8D"
    }
}

function changeButtonColorPause(isSwitch) {
    if (isSwitch) {
        document.getElementById("pause-button").style.backgroundColor = "rgb(39, 79, 75)"
    } else {
        document.getElementById("pause-button").style.backgroundColor = "#03FB8D"
    }
}

function newGame() {
    if(!buttonRules.newGame) {
        buttonRules.start = false ;
        changeButtonColorStart(false) ;
        buttonRules.pause = true ;
        changeButtonColorPause(true) ;
    
        // when newgame, everything is set to 0, so user unpress all the buttons
        clearTimeout(gameInstance.interval) ;
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height) ;
        ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
        gameInstance.newGame('E');
        gameInstance.drawGameStep(ctx) ;
    
        ctx2.clearRect(0,0,ctx2.canvas.width, ctx2.canvas.height) ;
        ctx2.fillStyle = "#000000B0";
        ctx2.fillRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
        ctx2.strokeStyle = "#03FB8D";
        ctx2.fillStyle = "#03FB8D";
        ctx2.textAlign = "center";
        ctx2.font = 'italic ' + ctx2.canvas.height/25 +'px Orbitron';
        ctx2.fillText("Press Start Game to start", ctx2.canvas.width/2, ctx2.canvas.height/2-ctx2.canvas.height/15);
        ctx2.fillText("Use pad or arrows keys to move", ctx2.canvas.width/2, ctx2.canvas.height/2+ctx2.canvas.height/15);
    }

}

function pause() {

    if (!gameInstance.snake.isDead & buttonRules.start) {
        // can't pause with a game over
        if (!buttonRules.pause) {
            // if button is not press, the game pause
            clearTimeout(gameInstance.interval) ;
            // stop the game
            buttonRules.pause = true;
            changeButtonColorPause(true) ;
            buttonRules.newGame = true;
            changeButtonColorNewGame(true) ;

            // draw pause menu
            ctx2.fillStyle = "#000000B0";
            ctx2.fillRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
            ctx2.strokeStyle = "#03FB8D";
            ctx2.textAlign = "center";
            ctx2.font = 'italic ' + ctx2.canvas.height/8 +'px Orbitron';
            ctx2.strokeText("PAUSE", ctx2.canvas.width/2, ctx2.canvas.height/2);
        } else {
            // if button is not press, the game is launch again
            buttonRules.pause = false;
            changeButtonColorPause(false) ;
            buttonRules.newGame = false;
            changeButtonColorNewGame(false) ;
            ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
            if (buttonRules.start) {
                activateGame() ;
            }
        }
    }
}

let cpt = 0

function animGameOver() {
    // draw annimation for the game over
    ctx2.clearRect(0,0,ctx2.canvas.width, ctx2.canvas.height) ;
    ctx2.fillStyle = "rgb(0,0,0,"+(cpt+1)/420+")";
    ctx2.fillRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    ctx.textAlign = "PAUSE";
    ctx2.strokeStyle = "#03FB8D";
    ctx2.textAlign = "center";
    ctx2.font = 'italic ' + ctx2.canvas.height/8 +'px Orbitron';
    ctx2.strokeText("GAME OVER", ctx2.canvas.width/2, ctx2.canvas.height/2);
    cpt++ ;
    if (cpt < 420) {
        gameInstance.interval = setTimeout(animGameOver, 16);
    }  else {
        buttonRules.newGame = false ;
        changeButtonColorNewGame(false) ;
    }
}

function gameOver() {
    // launch gameOver with animation and sound
    cpt = 0
    clearTimeout(gameInstance.interval) ;
    gameInstance.sound.gameOver.play();

    buttonRules.newGame = true ;
    changeButtonColorNewGame(true) ;
    buttonRules.start = true ;
    changeButtonColorStart(true) ;
    buttonRules.pause = true ;
    changeButtonColorPause(true) ;


    animGameOver() ;
}

function activateGame() {
    gameInstance.setExecution() ;
    gameInstance.drawGameStep(ctx) ;

    if(!gameInstance.snake.isDead) {
        gameInstance.interval = setTimeout(activateGame, gameInstance.stepSpeed);
    } 
}

function pressStart() {
    if (!gameInstance.snake.isDead && !buttonRules.start && !buttonRules.pause) {
        // can't start the game is snake is dead, or if game already started, or if game is in pause
        ctx2.clearRect(0,0,ctx2.canvas.width, ctx2.canvas.height) ;
        buttonRules.start = false ;
        changeButtonColorStart(false) ;
        buttonRules.pause = false ;
        changeButtonColorPause(false) ;
        activateGame() ;
    }
}

/* function to move the snake */

function onTheTop() {
    if(gameInstance.snake.stepDirection !== 'S') {
        gameInstance.snake.direction = 'N';
    }
}

function down() {
    if(gameInstance.snake.stepDirection !== 'N') {
        gameInstance.snake.direction = 'S';
    }
}

function toTheLeft() {
    if(gameInstance.snake.stepDirection !== 'E') {
        gameInstance.snake.direction = 'W';
    }
}

function toTheRight() {
    if(gameInstance.snake.stepDirection !== 'W') {
        gameInstance.snake.direction = 'E';
    }
}

//  user keyboardket to move the snake

window.addEventListener('keydown',check,false);

function check(e) {
    var code = e.keyCode;
    //Up arrow pressed
    switch(code) {
        case 37:
            toTheLeft();
            break;
        case 38:
            onTheTop();
            break;
        case 39:
            toTheRight();
            break;
        case 40:
            down();
            break;
    }
}

/* when windows size modification, update the display of the game */



function whenRefresh() {
    gameInstance.updateGridSize(ctx) ;
    gameInstance.updateGridSize(ctx2) ;
    gameInstance.drawGameStep(ctx) ;
}

window.onload = newGame;
window.onresize = whenRefresh;

/* main */


const canvasGame = document.getElementById("canvas-game");
const canvasPause = document.getElementById("canvas-pause");
const ctx = canvasGame.getContext("2d");
    // game interface
const ctx2 = canvasPause.getContext("2d");
    // pause and game over interface


const gameInstance = new game(20, 400, 50, 'E');
gameInstance.updateGridSize(ctx);
gameInstance.updateGridSize(ctx2);
     // dont need to updgrade ctx2 size because its css width is 100%












