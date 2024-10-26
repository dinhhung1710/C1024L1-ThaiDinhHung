// Bước 1: Lấy thông tin từ canvas
const canvas = document.getElementById('gameCanvas'); // Lấy canvas từ HTML
const context = canvas.getContext('2d'); // Lấy ngữ cảnh để vẽ lên canvas
const grid = 30; // Kích thước mỗi ô lưới

// Bước 2: Định nghĩa các hình khối Tetris
const tetrominoes = [
    [[1, 1, 1, 1]],             // Hình I
    [[1, 1], [1, 1]],           // Hình O
    [[0, 1, 0], [1, 1, 1]],     // Hình T
    [[1, 1, 0], [0, 1, 1]],     // Hình Z
    [[0, 1, 1], [1, 1, 0]]      // Hình S
];

// Bước 3: Định nghĩa màu cho các hình khối
const colors = ['cyan', 'yellow', 'purple', 'red', 'green'];
let board = []; // Bảng trò chơi
let currentPiece = { shape: null, color: null, x: 0, y: 0 }; // Khối hiện tại
let dropStart = Date.now(); // Thời gian bắt đầu rơi
let dropInterval = 1000; // Khối sẽ rơi sau mỗi 1 giây

// Bước 4: Tạo bảng trò chơi
function createBoard() {
    board = Array.from({ length: canvas.height / grid }, () =>
        Array(canvas.width / grid).fill(0) // Tạo bảng trống
    );
}

// Bước 5: Vẽ bảng trò chơi
function drawBoard() {
    for (let row = 0; row < board.length; row++) { // Duyệt từng hàng
        for (let col = 0; col < board[row].length; col++) { // Duyệt từng cột
            if (board[row][col] !== 0) { // Nếu ô không trống
                context.fillStyle = colors[board[row][col] - 1]; // Chọn màu
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1); // Vẽ ô
            }
        }
    }
}

// Bước 6: Vẽ khối Tetris
function drawPiece() {
    currentPiece.shape.forEach((row, y) => { // Duyệt qua từng hàng của khối
        row.forEach((value, x) => { // Duyệt qua từng cột của khối
            if (value !== 0) { // Nếu ô không trống
                context.fillStyle = currentPiece.color; // Chọn màu cho khối
                context.fillRect((currentPiece.x + x) * grid, (currentPiece.y + y) * grid, grid - 1, grid - 1); // Vẽ khối
            }
        });
    });
}

// Bước 7: Sinh khối mới
function newPiece() {
    const random = Math.floor(Math.random() * tetrominoes.length); // Chọn ngẫu nhiên khối
    currentPiece.shape = tetrominoes[random]; // Gán hình dạng
    currentPiece.color = colors[random]; // Gán màu
    currentPiece.x = Math.floor((canvas.width / grid) / 2) - Math.floor(currentPiece.shape[0].length / 2); // Đặt khối vào giữa
    currentPiece.y = 0; // Đặt khối ở trên cùng
}

// Bước 8: Di chuyển khối
function movePiece(dx, dy) {
    currentPiece.x += dx; // Di chuyển theo chiều ngang
    currentPiece.y += dy; // Di chuyển theo chiều dọc

    if (isColliding()) { // Kiểm tra va chạm
        currentPiece.x -= dx; // Quay lại vị trí cũ
        currentPiece.y -= dy; // Quay lại vị trí cũ
        return true; // Trả về true nếu va chạm
    }
    return false; // Trả về false nếu không va chạm
}

// Bước 9: Kiểm tra va chạm
function isColliding() {
    for (let y = 0; y < currentPiece.shape.length; y++) { // Duyệt qua từng hàng
        for (let x = 0; x < currentPiece.shape[y].length; x++) { // Duyệt qua từng cột
            if (currentPiece.shape[y][x] !== 0) { // Nếu ô không trống
                const newX = currentPiece.x + x; // Tính vị trí mới theo chiều ngang
                const newY = currentPiece.y + y; // Tính vị trí mới theo chiều dọc

                // Kiểm tra xem vị trí mới có nằm trong bảng không
                if (newX < 0 || newX >= canvas.width / grid || newY >= canvas.height / grid || (board[newY] && board[newY][newX] !== 0)) {
                    return true; // Nếu va chạm, trả về true
                }
            }
        }
    }
    return false; // Nếu không va chạm, trả về false
}

// Bước 10: Đặt khối xuống bảng
function placePiece() {
    currentPiece.shape.forEach((row, y) => { // Duyệt qua từng hàng của khối
        row.forEach((value, x) => { // Duyệt qua từng cột của khối
            if (value !== 0) { // Nếu ô không trống
                board[currentPiece.y + y][currentPiece.x + x] = colors.indexOf(currentPiece.color) + 1; // Đặt màu vào bảng
            }
        });
    });
}

// Bước 11: Xóa hàng đầy đủ
function clearLines() {
    board = board.filter(row => row.some(cell => cell === 0)); // Giữ lại các hàng chưa đầy
    while (board.length < canvas.height / grid) { // Khi bảng thiếu hàng
        board.unshift(new Array(canvas.width / grid).fill(0)); // Thêm hàng mới trống ở trên cùng
    }
}

// Bước 12: Xoay khối
function rotatePiece() {
    const newShape = currentPiece.shape[0].map((_, index) => // Xoay khối
        currentPiece.shape.map(row => row[index]).reverse() // Đảo hàng thành cột
    );
    const prevShape = currentPiece.shape; // Lưu hình dạng ban đầu
    const prevX = currentPiece.x; // Lưu vị trí ban đầu
    currentPiece.shape = newShape; // Cập nhật hình dạng mới

    // Kiểm tra va chạm sau khi xoay
    if (isColliding()) {
        currentPiece.shape = prevShape; // Khôi phục lại hình dạng ban đầu nếu va chạm
        currentPiece.x = prevX; // Khôi phục lại vị trí ban đầu
    }
}

// Bước 13: Cập nhật trò chơi
function update() {
    let now = Date.now(); // Lấy thời gian hiện tại
    let delta = now - dropStart; // Tính thời gian đã trôi qua

    if (delta >= dropInterval) { // Nếu đã đến thời gian rơi
        if (movePiece(0, 1)) { // Di chuyển khối xuống
            placePiece(); // Đặt khối xuống bảng
            clearLines(); // Xóa các hàng đầy đủ
            newPiece(); // Sinh khối mới
            // Kiểm tra nếu khối mới sinh ra va chạm
            if (isColliding()) {
                alert("Game Over!"); // Thông báo Game Over
                createBoard(); // Tạo lại bảng
            }
        }

        dropStart = Date.now(); // Reset thời gian bắt đầu rơi
    }

    context.clearRect(0, 0, canvas.width, canvas.height); // Xóa canvas
    drawBoard(); // Vẽ bảng trò chơi
    drawPiece(); // Vẽ khối hiện tại
