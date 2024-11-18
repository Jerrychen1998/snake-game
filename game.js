// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficultySelect');
const mobileControls = document.getElementById('mobileControls');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 难度设置
const speedSettings = {
    easy: 150,
    normal: 100,
    hard: 60
};

// 游戏状态
let gameSpeed = speedSettings.normal;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = `最高分：${highScore}`;

// 初始化移动设备检测
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// 如果是移动设备，显示触摸控制
if (isMobileDevice()) {
    mobileControls.style.display = 'block';
    // 调整画布大小以适应移动屏幕
    const screenWidth = Math.min(window.innerWidth - 20, 400);
    canvas.width = screenWidth;
    canvas.height = screenWidth;
}

// 添加触摸控制事件
document.getElementById('upBtn').addEventListener('touchstart', () => changeDirection('ArrowUp'));
document.getElementById('downBtn').addEventListener('touchstart', () => changeDirection('ArrowDown'));
document.getElementById('leftBtn').addEventListener('touchstart', () => changeDirection('ArrowLeft'));
document.getElementById('rightBtn').addEventListener('touchstart', () => changeDirection('ArrowRight'));

// 难度选择事件
difficultySelect.addEventListener('change', function() {
    gameSpeed = speedSettings[this.value];
});

// 更新最高分
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = `最高分：${highScore}`;
    }
}

// 修改游戏主循环
function gameLoop() {
    if (gameOver) return;
    
    setTimeout(function() {
        clearCanvas();
        moveSnake();
        checkCollision();
        drawFood();
        drawSnake();
        
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        } else {
            updateHighScore();
        }
    }, gameSpeed);
}

// 方向改变函数
function changeDirection(direction) {
    switch(direction) {
        case 'ArrowUp':
            if (snake.dy !== 1) {
                snake.nextDx = 0;
                snake.nextDy = -1;
            }
            break;
        case 'ArrowDown':
            if (snake.dy !== -1) {
                snake.nextDx = 0;
                snake.nextDy = 1;
            }
            break;
        case 'ArrowLeft':
            if (snake.dx !== 1) {
                snake.nextDx = -1;
                snake.nextDy = 0;
            }
            break;
        case 'ArrowRight':
            if (snake.dx !== -1) {
                snake.nextDx = 1;
                snake.nextDy = 0;
            }
            break;
    }
}

// 修改键盘控制
document.addEventListener('keydown', function(event) {
    changeDirection(event.key);
});

// 修改重新开始游戏函数
function restartGame() {
    snake = {
        body: [{x: 10, y: 10}],
        dx: 0,
        dy: 0,
        nextDx: 0,
        nextDy: 0
    };
    score = 0;
    scoreElement.textContent = `分数：${score}`;
    gameOver = false;
    restartBtn.style.display = 'none';
    gameSpeed = speedSettings[difficultySelect.value];
    generateFood();
    gameLoop();
}

// 蛇的初始状态
let snake = {
    body: [{x: 10, y: 10}],
    dx: 0,
    dy: 0,
    nextDx: 0,
    nextDy: 0
};

// 食物位置
let food = {
    x: 15,
    y: 15
};

// 清空画布
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 移动蛇
function moveSnake() {
    // 更新方向
    snake.dx = snake.nextDx;
    snake.dy = snake.nextDy;
    
    // 移动蛇头
    const head = {
        x: snake.body[0].x + snake.dx,
        y: snake.body[0].y + snake.dy
    };
    
    snake.body.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `分数：${score}`;
        generateFood();
    } else {
        snake.body.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake.body[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            gameOver = true;
        }
    }
    
    if (gameOver) {
        restartBtn.style.display = 'block';
    }
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// 绘制蛇
function drawSnake() {
    ctx.fillStyle = 'green';
    snake.body.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

// 生成新的食物位置
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

restartBtn.addEventListener('click', restartGame);

// 开始游戏
generateFood();
gameLoop(); 