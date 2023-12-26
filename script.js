//Tomar del documento todos los elementos que vamos a utilizar
const board = document.getElementById('board'); //tablero
const scoreBoard = document.getElementById('scoreBoard'); //puntos del usuario
const startButton = document.getElementById('start'); //empezar el juego
const gameOverSign = document.getElementById('gameOver'); //oculto y se muestra cuando termina el juego

//Ajustes del juego

const boardSize = 10; //tamaño del board 10x10
const gameSpeed = 100; //velocidad 100 milisegundos
const squareTypes = {
    emptySquare: 0,
    snakeSquare: 1,
    foodSquare: 2
} //tipos de cuadrado con un valor cada uno. Este objeto lo vamos a usar para ir seteando los valores a medida que avanza el juego

const directions = {
    ArrowUp: -10, //si esta en el 35, pasa al 25
    ArrowDown: 10, // si esta en el 35, pasa al 45
    ArrowRight: 1, //si esta en el 35, pasa al 36
    ArrowLeft: -1, //si esta en el 35, pasa al 34
}; //mapeo de direcciones por cantidad de lugares que se mueve, asi sabemos en qué dirección se mueve la snake

//Variables del juego

let snake; //array donde vamos a guardar a la serpiente con todos los valores que esta ocupando
let score;
let direction; //cada vez que aprieta el usuario hay que guardar la direccion para saber cuantos lugares se mueve
let boardSquares; //guarda el array con info del tablero
let emptySquares; //guarda la cantidad de lugares vacios que hay para poder ubicar la comida de forma aleatoria cada vez
let moveInterval; //guarda el intervalo que vamos a usar para iterar el movimiento de la serpiente cada determinado tiempo

const drawSnake = () => {//para dibujar la snake tomamos la snake declarada y usamos la funcion dibujarSquare para hacer la cantidad de squares que ocupa la snake
    snake.forEach(square => drawSquare(square, 'snakeSquare')); //le pasamos los cuadrados que ocupa y le decimos que los dibuje de tipo snake
}

//dibujar cuadrado
//Rellena cada cuadrado del tablero
//parametros @params
//square: posicion del cuadrado
//type: tipo de cuadrado (emptySquare, snakeSquare, foodSquare)

const drawSquare = (square, type) => {
    const [row, column] = square.split(''); //separa el string, la row y la columna porque el square viene junto 00
    boardSquares[row][column] = squareTypes[type]; // una vez separadas, le pasamos el tipo de square
    const squareElement = document.getElementById(square); //tomamos el elemento que esta guardado en los datos con el id
    squareElement.setAttribute('class', `square ${type}`); //le asignamos una clase segun el tipo de square
    //hay dos posibilidades:
    //si queremos crear un elemento tipo emptySquare, tomamos el array y le agregamos el nuevo square, cuando queda un lugar vacio y donde es posible dejar comida
    if (type === 'emptySquare') {
        emptySquares.push(square);
    } else { //si no es un emptySquare hay que sacarlo del array de lugares vacios, porque esta ocupado
        if (emptySquares.indexOf(square) !== -1) { //primero consultamos si emptySquare contiene ese elemento porque puede ser uno de los elementos de la snake y no es necesario sacarlo porque no estaba
            emptySquares.splice(emptySquares.indexOf(square), 1);
        } //si existe, lo sacamos con splice (partir y reemplazar) el index para sacarlo y el '1' porque es un solo elemento
    }

}

const moveSnake = () => {
    const newSquare = String(//primero necesitamos saber cual es el nuevo square para saber en que direccion se esta moviendo
        Number(snake[snake.length - 1]) + directions[direction])//crea un nuevo square que va a ser un string compuesta por el ultimo lugar de la snake, el ultimo square (snake.length -1 + el valor que le corresponde a la direccion 
        .padStart(2, '0'); //obtiene el nuevo cuadrado adonde se tiene que mover, indica que son dos digitos y le agrega un 0 adelante si tiene un solo numero, para conocer el id
    const [row, column] = newSquare.split(''); //del nuevo square tomamos la row y la columna, es decir, el primero y el segundo valor para poder seleccionarlo despues del boardSquare
    //condiciones de movimiento de la snake:

    if (newSquare < 0 || // el juego se termina cuando se choca. Si el nuevo square es <0 quiere decir que se choco contra arriba
        newSquare > boardSize * boardSize || // o se fue mas alla del board, 99 se choco contra abajo
        (direction === 'ArrowRight' && column == 0) || // si esta yendo hacia la derecha y la columna es igual a 0, es porque se choco contra la derecha porque las columnas son 9
        (direction === 'ArrowLeft' && column == 9 || // si esta yendo hacia la izquierda y la columna es igual a 9 es porque se pasó 
            boardSquares[row][column] === squareTypes.snakeSquare)) { // por ultimo, consulta si el square es parte de la snake, se choco contra ella misma
        gameOver(); //si sucede alguna de estas condiciones, pierde
    } else {
        snake.push(newSquare); //pinta el color del snakeSquare que se agrega, el primero a agregar es el 04
        if (boardSquares[row][column] === squareTypes.foodSquare) { //si el nuevo square era comida, hay que sumar un nuevo score y crece la snake
            addFood();
        } else {// si no es comida:
            const emptySquare = snake.shift(); //pintamos dos square, uno nuevo para la snake y uno vacio para el lugar que deja. El shift de la snake te da el primer elemento y se lo sacamos, vuelve a ser un empty
            drawSquare(emptySquare, 'emptySquare');
        }
        drawSnake(); //por ultimo volvemos a buscar el
    }
}

const addFood = () => {
    score++; //sube el score
    updateScore(); // actualiza el score
    createRandomFood(); //crea un nuevo square de comida
}

const gameOver = () => {
    gameOverSign.style.display = 'block'; //muestra el gameOverSign 
    clearInterval(moveInterval) //frena el intervalo para que la snake deje de moverse
    startButton.disabled = false; //se vuelve a habilitar el startButton
}

const setDirection = newDirection => { //recibe una nueva dirección y setea la variable direction declarada previamente hacia la derecha
    direction = newDirection;
}

const directionEvent = key => { //activa la key que se presionó y activa el switch
    switch (key.code) { //pregunta el key code, que tipo de codigo vino cuando el usuario presionó la tecla
        case 'ArrowUp': //llamamos a la función setDirection
            direction != 'ArrowDown' && setDirection(key.code) //si direction no es Down, darle la nueva dirección. La snake no puede ir en reversa, entonces siempre se debe chequear que no vaya en sentido contrario
            break;
        case 'ArrowDown':
            direction != 'ArrowUp' && setDirection(key.code)
            break;
        case 'ArrowLeft':
            direction != 'ArrowRight' && setDirection(key.code)
            break;
        case 'ArrowRight':
            direction != 'ArrowLeft' && setDirection(key.code)
            break;
    }
}
const createRandomFood = () => { //no tiene argumento, crea un lugar random entre todos los lugares vacíos que hay guardados en emptySquares
    const randomEmptySquare = emptySquares[Math.floor(Math.random() * emptySquares.length)]; // toma un elemento al azar con Math.floor (math.random multiplicado por el largo del array) que va a dar un numero aleatorio entre 0 y el ultimo lugar de ese array
    drawSquare(randomEmptySquare, 'foodSquare'); // a drawSquare le pasamos el square que acabamos de crear, le avisamos que es un foodSquare para que lo pinte
} //lo vamos a usar cada vez que se mueva la serpiente

const updateScore = () => {
    scoreBoard.innerText = score; //al scoreBoard se le agrega innerText el score (largo de la snake)
}

//crear tablero
const createBoard = () => {
    boardSquares.forEach((row, rowIndex) => {
        row.forEach((column, columnndex) => {
            const squareValue = `${rowIndex}${columnndex}`;
            const squareElement = document.createElement('div');
            squareElement.setAttribute('class', 'square emptySquare');
            squareElement.setAttribute('id', squareValue);
            board.appendChild(squareElement);
            emptySquares.push(squareValue);
        })
    })
}
//va a iterar el array creado y por cada una de las rows vamos a tener la row y rowIndex. A la vez se van a iterar las rows para obtener cada uno de los elementos
//así va a iterar cada uno de los elementos del tablero
//por cada uno de los elementos, se va a crear el valor que va a identificar el cuadrado row/index es decir la ubicacion en el tablero
//tambien se crea un elemento div con una clase y un id con su valor que se va a insertar en el tablero 
//tomar el board y cada vez que creamos un elemento agregarselo al board
//push a emptysquare del valor del square, para agregar al array de rectangulos vacios

//primero se setean las variables
const setGame = () => {
    snake = ['00', '01', '02', '03']; //tiene un largo de cuatro lugares y se encuentra en el lado superior izquierdo
    score = snake.length;
    direction = 'ArrowRight'; //hacia la derecha
    boardSquares = Array.from(Array(boardSize), () => new Array(boardSize).fill(squareTypes.emptySquare)); //Es un array de dos dimensiones: array from toma dos parametros 1) array del tamaño del tablero (10) y cada uno va a ser otro array tambien de 10 elementos y se va a rellenar con ceros, lugares vacios (emptySquare) 0=a un tablero vacio
    console.log(boardSquares);
    board.innerHTML = ''; //si el jugador pierde, vuelve a cero
    emptySquares = [];
    createBoard();
}
//dar inicio al juego

const startGame = () => {
    setGame();
    gameOverSign.style.display = 'none';
    startButton.disabled = true;
    drawSnake(); //para dibujar la serpiente hay que saber como dibujar un cuadrado primero
    updateScore(); //actualizar el score al iniciar el juego
    createRandomFood(); //al iniciar el juego y cada vez que la snake come
    document.addEventListener('keydown', directionEvent); //agregar los eventListeners a las flechas del teclado del usuario. Cuando se presiona (keydown) llamamos a la funcion directionEvent
    moveInterval = setInterval(() => moveSnake(), gameSpeed); //intervalo que va a hacer que se mueva la snake a la velocidad seteada en la variable gameSpeed
    //moveInterval declarado arriba, es un setInterval que se va a ejecutar constantemente cada vez que pase el tiempo seteado a gameSpeed y va a ejecutar la función moveSnake(), es decir, cada 100 milisegundos va a hacer que se mueva la serpiente 
}

startButton.addEventListener('click', startGame);