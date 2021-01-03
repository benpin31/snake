/*  Object grid */

class grid {
    constructor(dimensions, applePosition) {
        // all positions = [absciss, ordinate]
        this._dimensions = dimensions ;
        this._applePosition = applePosition ;
    }

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

    /*  */
    isInGrid(position) {
        return  position[0] > 0 && position[0] <= this._dimensions[0] &&
                position[1] > 0 && position[1] <= this._dimensions[1] ; 
    }

    isAnApple(position) {
        return position[0] === this._applePosition[0] && position[1] === this._applePosition[1];
    }


}

/*  Object snake */


class snake {
    /* constructor */
    constructor(direction, position) {
        // all position = [absciss, ordinate]
        this._direction = direction ;
        this._position = position ;
        // last element of position is the head of the snake
        this._isDead = false ;
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

    /* Various */

    copySnakePosition() {
        let copy = [];
    
        this._position.forEach(cell => {
            copy.push(cell.slice()) ;
        }) ;
        return(copy) ;
    }

    /* Moving function */

    nextHeadPosition() {
        let nextHeadPosition ;
        let headPosition = this.getHeadPosition().slice();

        switch(this._direction) {
            case 'N':
                nextHeadPosition = [headPosition[0], headPosition[1] + 1] ;
                break;
            case 'S':
                nextHeadPosition = [headPosition[0], headPosition[1] - 1] ;
                break;
            case 'E':
                nextHeadPosition = [headPosition[0] + 1, headPosition[1]] ;
                break ;
            case 'W':
                nextHeadPosition = [headPosition[0] - 1, headPosition[1]] ;
                break ;
            default:
                nextHeadPosition = headPosition ;
        }

        return nextHeadPosition
    }

    static willCrashedOnHimself(nextPosition) {
        let cpt = 0 ;
        let headPosition = nextPosition[nextPosition.length-1] ;

        nextPosition.slice(0, nextPosition.length-1).forEach(part => {
            if (part[0] === headPosition[0] && part[1] === headPosition[1]) {
                cpt++;
            }
        });
        return cpt > 0;
    }

    static willCrashed(nextPosition, gridInstance) {
        let nextHeadPosition = nextPosition[nextPosition.length-1]        
        return  !gridInstance.isInGrid(nextHeadPosition) || snake.willCrashedOnHimself(nextPosition) ;
    }

    move(gridInstance) {
        console.log(this._position) ;

        let nextHeadPosition = this.nextHeadPosition() ;
        let nextPosition = this.copySnakePosition() ;

        if (gridInstance.isAnApple(nextHeadPosition)) {
            nextPosition.push(nextHeadPosition) ;
        } else {
            nextPosition.push(nextHeadPosition) ;
            nextPosition = nextPosition.slice(1) ;
        }

        if (snake.willCrashed(nextPosition, gridInstance)) {
            this._isDead = true ;
        } else {
            this._position = nextPosition ;
        }

        console.log(this._position) ;
    }

}


/* main */

let snakeInstance = new snake('W', [[5,5]]);//, [6,6], [5,6], [4,6], [4,5]]) ;
let gridInstance = new grid([10,10], [4,5]) ;

/*a = snakeInstance.copySnakePosition() ;
a[2] = 1;
console.log(a)
console.log(snakeInstance._position) ;*/

//console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
//console.log(snakeInstance) ;
/*snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;*/

a = [1,2,3,3] ;
cpt = 0 ;
b = a[a.length-1];
a.slice(0,a.length-1).forEach(element => {
    if(element === b) {
        cpt++
    }
}) ;
console.log(cpt)
