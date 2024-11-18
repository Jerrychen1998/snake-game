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
    easy: 500,     // 每500ms移动一次，每秒2格
    normal: 333,   // 每333ms移动一次，每秒3格
    hard: 250      // 每250ms移动一次，每秒4格
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
    // 调整画布大小以适移动屏幕
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
    updateSpeedDisplay(this.value);
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
let lastMoveTime = 0;

function gameLoop(currentTime) {
    if (gameOver) return;
    
    window.requestAnimationFrame(gameLoop);
    
    // 计算从上次移动到现在经过的时间
    if (!lastMoveTime) {
        lastMoveTime = currentTime;
        return;
    }
    
    const timeSinceLastMove = currentTime - lastMoveTime;
    
    // 只有当经过的时间超过移动间隔时才移动蛇
    if (timeSinceLastMove >= gameSpeed) {
        update();
        draw();
        lastMoveTime = currentTime;
    }
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
    
    initObstacles();
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

// 添加食物类型
const foodTypes = {
    normal: {
        color: 'red',
        points: 10,
        probability: 0.7,
        effect: null
    },
    speed: {
        color: 'yellow',
        points: 20,
        probability: 0.1,
        effect: (snake) => {
            const currentSpeed = gameSpeed;
            gameSpeed = gameSpeed * 0.8;
            setTimeout(() => { gameSpeed = currentSpeed; }, 5000);
        }
    },
    bonus: {
        color: 'purple',
        points: 30,
        probability: 0.1,
        effect: null
    },
    shrink: {
        color: 'blue',
        points: 15,
        probability: 0.1,
        effect: (snake) => {
            if (snake.body.length > 3) {
                snake.body = snake.body.slice(0, snake.body.length - 2);
            }
        }
    }
};

// 修改食物对象结构
let food = {
    x: 15,
    y: 15,
    type: 'normal'
};

// 添加障碍物系统
const obstacles = [];
const maxObstacles = 5;

// 初始化障碍物
function initObstacles() {
    obstacles.length = 0;
    for (let i = 0; i < maxObstacles; i++) {
        generateObstacle();
    }
}

// 生成障碍物
function generateObstacle() {
    let x, y;
    do {
        x = Math.floor(Math.random() * tileCount);
        y = Math.floor(Math.random() * tileCount);
    } while (isPositionOccupied(x, y));
    
    obstacles.push({ x, y });
}

// 检查位置是否被占用
function isPositionOccupied(x, y) {
    // 检查是否与蛇重叠
    if (snake.body.some(segment => segment.x === x && segment.y === y)) {
        return true;
    }
    // 检查是否与食物重叠
    if (food.x === x && food.y === y) {
        return true;
    }
    // 检查是否与其他障碍物重叠
    return obstacles.some(obs => obs.x === x && obs.y === y);
}

// 修改生成食物的函数
function generateFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * tileCount);
        y = Math.floor(Math.random() * tileCount);
    } while (isPositionOccupied(x, y));

    // 根据概率选择食物类型
    const rand = Math.random();
    let probabilitySum = 0;
    let selectedType = 'normal';
    
    for (const [type, props] of Object.entries(foodTypes)) {
        probabilitySum += props.probability;
        if (rand <= probabilitySum) {
            selectedType = type;
            break;
        }
    }

    food = {
        x: x,
        y: y,
        type: selectedType
    };
}

// 修改绘制食物的函数
function drawFood() {
    const foodProps = foodTypes[food.type];
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = foodProps.color;
    ctx.fill();
}

// 绘制障碍物
function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(
            obstacle.x * gridSize,
            obstacle.y * gridSize,
            gridSize - 2,
            gridSize - 2
        );
    });
}

// 修改碰撞检测函数
function checkCollision() {
    const head = snake.body[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        return;
    }
    
    // 检查障碍物碰撞
    if (obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
        gameOver = true;
        return;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            gameOver = true;
            return;
        }
    }
    
    if (gameOver) {
        restartBtn.style.display = 'block';
        updateHighScore();
    }
}

// 修改移动蛇的函数
function moveSnake() {
    snake.dx = snake.nextDx;
    snake.dy = snake.nextDy;
    
    const head = {
        x: snake.body[0].x + snake.dx,
        y: snake.body[0].y + snake.dy
    };
    
    snake.body.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        const foodProps = foodTypes[food.type];
        score += foodProps.points;
        scoreElement.textContent = `分数：${score}`;
        
        // 应用食物效果
        if (foodProps.effect) {
            foodProps.effect(snake);
        }
        
        generateFood();
    } else {
        snake.body.pop();
    }
}

// 修改绘制函数
function draw() {
    clearCanvas();
    drawObstacles();
    drawFood();
    drawSnake();
}

// 修改更新函数
function update() {
    moveSnake();
    checkCollision();
}

// 清空画布
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 绘制蛇
function drawSnake() {
    snake.body.forEach((segment, index) => {
        ctx.fillStyle = `hsl(${120 + index * 5}, 70%, 50%)`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

restartBtn.addEventListener('click', restartGame);

// 开始游戏
generateFood();
gameLoop();

// 可以添加游戏音效系统
function addSoundSystem() {
    const eatSound = new Audio('eat.mp3');
    const gameOverSound = new Audio('gameover.mp3');
    // ... 音效相关代码
}

// 可以添加游戏暂停功能
function addPauseFeature() {
    let isPaused = false;
    // ... 暂停相关代码
}

// 添加速度显示更新函数
function updateSpeedDisplay(difficulty) {
    const speedDisplay = document.getElementById('speedDisplay');
    const speed = {
        easy: "2.0",
        normal: "3.0",
        hard: "4.0"
    };
    speedDisplay.textContent = `当前速度：每秒${speed[difficulty]}格`;
} 