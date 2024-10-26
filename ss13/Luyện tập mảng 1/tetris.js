const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 30;  // Kích thước mỗi ô lưới
const tetrominoes = [
    [[1, 1, 1, 1]],             // I
    [[1, 1], [1, 1]],           // O
    [[0, 1, 0], [1, 1, 1]],     // T
    [[1, 1, 0], [0, 1, 1]],     // Z
    [[0, 1, 1], [1, 1, 0]]      // S
];
const colors = ['cyan', 'yellow', 'purple', 'red', 'green'];
let board = [];
let currentPiece = { shape: null, color: null, x: 0, y: 0 };
let dropStart = Date.now();
let dropInterval = 1000; // Khối sẽ tự rơi sau mỗi 1 giây

// Tạo bảng trò chơi
function createBoard() {
    board = Array.from({ length: canvas.height / grid }, () =>
        Array(canvas.width / grid).fill(0)
    );
}

// Vẽ bảng trò chơi
function drawBoard() {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] !== 0) {
                context.fillStyle = colors[board[row][col] - 1];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }
}

// Vẽ khối tetromino
function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = currentPiece.color;
                context.fillRect((currentPiece.x + x) * grid, (currentPiece.y + y) * grid, grid - 1, grid - 1);
            }
        });
    });
}

// Sinh khối mới
function newPiece() {
    const random = Math.floor(Math.random() * tetrominoes.length);
    currentPiece.shape = tetrominoes[random];
    currentPiece.color = colors[random];
    currentPiece.x = Math.floor((canvas.width / grid) / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;
}

// Di chuyển khối
function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;

    if (isColliding()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        return true;  // Trả về true nếu va chạm
    }
    return false;  // Trả về false nếu không va chạm
}

// Kiểm tra va chạm
function isColliding() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] !== 0) {
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;

                if (newX < 0 || newX >= canvas.width / grid || newY >= canvas.height / grid || (board[newY] && board[newY][newX] !== 0)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Đặt khối xuống bảng
function placePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[currentPiece.y + y][currentPiece.x + x] = colors.indexOf(currentPiece.color) + 1;
            }
        });
    });
}

// Xóa hàng đầy đủ
function clearLines() {
    board = board.filter(row => row.some(cell => cell === 0));  // Giữ lại các hàng chưa đầy
    while (board.length < canvas.height / grid) {
        board.unshift(new Array(canvas.width / grid).fill(0));  // Thêm các hàng trống ở trên cùng
    }
}

// Xoay khối
function rotatePiece() {
    const newShape = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    const prevShape = currentPiece.shape;  // Lưu lại hình dạng ban đầu
    const prevX = currentPiece.x;          // Lưu lại vị trí ban đầu
    currentPiece.shape = newShape;

    // Kiểm tra va chạm sau khi xoay
    if (isColliding()) {
        currentPiece.shape = prevShape; // Khôi phục lại hình dạng ban đầu nếu va chạm
        currentPiece.x = prevX;         // Khôi phục lại vị trí ban đầu
    }
}

// Cập nhật trò chơi và di chuyển khối xuống
function update() {
    let now = Date.now();
    let delta = now - dropStart;

    if (delta >= dropInterval) {
        if (movePiece(0, 1)) {  // Di chuyển khối xuống
            // Nếu va chạm khi di chuyển xuống, đặt khối xuống bảng
            placePiece();
            clearLines();  // Xóa các hàng đầy đủ
            newPiece();    // Sinh khối mới
            // Kiểm tra nếu khối mới sinh ra va chạm
            if (isColliding()) {
                alert("Game Over!");
                createBoard();
            }
        }

        dropStart = Date.now();  // Reset bộ đếm thời gian
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece();
    requestAnimationFrame(update);  // Liên tục cập nhật trò chơi
}

// Xử lý phím nhấn
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') movePiece(-1, 0);
    if (event.key === 'ArrowRight') movePiece(1, 0);
    if (event.key === 'ArrowDown') movePiece(0, 1);  // Làm khối rơi nhanh hơn khi nhấn mũi tên xuống
    if (event.key === 'ArrowUp') rotatePiece();  // Xoay khối
});

// Bắt đầu trò chơi
createBoard();
newPiece();
requestAnimationFrame(update);
