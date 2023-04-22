class Tetris {
    constructor() {
        // 初期化
        this.widthCellCount = 10;
        this.heightCellCount = 20;
        this.widthPixel = document.getElementById("stage").width;
        this.heightPixel = document.getElementById("stage").height;
        this.cellWidthPixel = this.widthPixel / this.widthCellCount;
        this.cellHeightPixel = this.heightPixel / this.heightCellCount;
        this.cellPixel = (this.cellWidthPixel > this.cellHeightPixel) ? this.cellHeightPixel : this.cellWidthPixel;

        this.stage = new Array(this.widthCellCount);
        for (let i = 0; i < this.widthCellCount; i++) {
            this.stage[i] = new Array(this.heightCellCount).fill(null);
        }

        this.blocks = [//yeahaammmm(つのだ☆ひろ_ダイヤモンド☆ユカイ)mmmmmmaaaaaaaneko:)
            // Oミノ
            {
                shape: [
                    [0, 0], [0, 1], [1, 0], [1, 1]
                ]
            },
            //Iミノ
            {
                shape: [
                    [0, 0], [0, 1], [0, 2], [0, 3]
                ]
            },
            // Tミノ
            {
                shape: [
                    [0, 0], [1, 0], [2, 0], [1, 1]
                ]
            },
            //Sミノ
            {
                shape: [
                    [0, 0], [0, 1], [1, 0], [1, 1]
                ]
            },
        ];

        this.fallSpeed = 500;
        this.count = 0;

        document.addEventListener('keydown', this.keydown.bind(this));
    }

    gamestart() {
        this.hasActiveBlock = false;
        this.isLanding = false;
        this.isGameOver = false;
        this.intervalId = setInterval(this.mainloop.bind(this), this.fallSpeed);
    }

    mainloop() {
        if (!this.hasActiveBlock) { // ブロックがないとき
            this.createBlock();     // 新たにブロックを作る
            this.isLanding = false;
        } else {
            this.fall();        // ブロックを一つ落とす
        }
        this.checkIsLanding();
        if (this.isGameOver) {
            document.getElementById('gameover').innerHTML = 'GAME OVER';
            clearInterval(this.intervalId);
        }
        this.clearStage();  // 画面を消す
        this.drawBlock();   // ブロックの描画
        if (this.isLanding) {   // ブロックが着地したとき
            this.hasActiveBlock = false;
            this.fixBlock(); // ブロックを固定する（配列を保存する）
            this.deleteLines();
        }
    }

    deleteLines() {
        let deleteFlags = new Array(this.heightCellCount);
        for (let y = 0; y < this.heightCellCount; y++) {
            // 第y行が埋まっているか判定
            let x;
            for (x = 0; x < this.widthCellCount; x++) {
                if (this.stage[x][y] != 1) {
                    // 次の行に進む
                    break;
                }
            }
            deleteFlags[y] = (x == this.widthCellCount);
        }

        for (let y = 0; y < this.heightCellCount; y++) {
            if (deleteFlags[y]) {
                // 第y行が埋まっているときの処理
                for (let x = 0; x < this.widthCellCount; x++) {
                    for (let updateY = y; updateY > 0; updateY--) {
                        this.stage[x][updateY] = this.stage[x][updateY - 1];
                    }
                    this.stage[x][0] = null;   // 一番上の行を消す                    
                }
            }
        }
    }

    keydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
        }
    }

    moveDown() {
        if (
            !this.isLanding
            && this.stage[this.blockX + this.blocks[0].shape[1][0]][this.blockY + this.blocks[0].shape[1][1] + 1] != 1
            && this.stage[this.blockX + this.blocks[0].shape[3][0]][this.blockY + this.blocks[0].shape[3][1] + 1] != 1
        ) {
            this.blockY++;
        }
        this.clearStage();
        this.drawBlock();
    }

    moveRight() {
        if (
            !this.isLanding
            && this.stage[this.blockX + this.blocks[0].shape[2][0] + 1][this.blockY + this.blocks[0].shape[2][1]] != 1
            && this.stage[this.blockX + this.blocks[0].shape[3][0] + 1][this.blockY + this.blocks[0].shape[3][1]] != 1
        ) {
            this.blockX++;
        }
        this.clearStage();
        this.drawBlock();
    }

    moveLeft() {
        if (
            !this.isLanding
            && this.stage[this.blockX + this.blocks[0].shape[0][0] - 1][this.blockY + this.blocks[0].shape[0][1]] != 1
            && this.stage[this.blockX + this.blocks[0].shape[1][0] - 1][this.blockY + this.blocks[0].shape[1][1]] != 1
        ) {
            this.blockX--;
        }
        this.clearStage();
        this.drawBlock();
    }

    createBlock() {
        // ブロックの初期設定
        this.blockX = this.widthCellCount / 2 - 1;  // X座標
        this.blockY = -1;                            // Y座標
        if (this.stage[this.blockX][this.blockY + 2/* めり込みに対してのとりあえずの処理、後で修正 */] == 1) {
            this.isGameOver = true;
        }
        this.blockType = 0;                         // ブロックの種類（後で乱数化する）
        this.hasActiveBlock = true;                 // 動かせるブロックが存在するか否か
    }

    fall() {
        if (
            !this.isLanding
            && this.stage[this.blockX + this.blocks[0].shape[1][0]][this.blockY + this.blocks[0].shape[1][1] + 1] != 1
            && this.stage[this.blockX + this.blocks[0].shape[3][0]][this.blockY + this.blocks[0].shape[3][1] + 1] != 1
        ) {
            this.blockY++;
        }
    }

    checkIsLanding() {
        if (
            this.blockY == this.heightCellCount - 2 /* めり込みに対してのとりあえずの処理、後で修正 */
            || !this.isMovable()
        ) {
            this.isLanding = true;
        } else {
            this.isLanding = false;
        }
    }

    isMovable() {
        if (
            !this.isLanding
            && this.stage[this.blockX + this.blocks[0].shape[1][0]][this.blockY + this.blocks[0].shape[1][1] + 1] != 1
            && this.stage[this.blockX + this.blocks[0].shape[3][0]][this.blockY + this.blocks[0].shape[3][1] + 1] != 1
        ) {
            return true;
        } else {
            return false;
        }
    }

    clearStage() {
        const canvas = document.getElementById('stage');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawBlock(this.stage);
    }

    drawBlock(stage) {
        const canvas = document.getElementById('stage');
        if (stage === undefined) {
            // 引数なしの時の処理
            var blockShape = this.blocks[this.blockType].shape;
            for (let i = 0; i < blockShape.length; i++) {
                let displacementX = blockShape[i][0];
                let displacementY = blockShape[i][1];
                this.drawCell(canvas, this.blockX + displacementX, this.blockY + displacementY, 'rgb(255, 255, 255');
            }
        } else {
            // 引数を指定したときの処理
            for (let x = 0; x < this.widthCellCount; x++) {
                for (let y = 0; y < this.heightCellCount; y++) {
                    if (this.stage[x][y] !== null) {
                        this.drawCell(canvas, x, y, 'rgb(255, 0, 0)');
                    }        
                }
            }
        }
    }

    drawCell(canvas, x, y, rgb) {
        const context = canvas.getContext('2d');
        context.fillStyle = rgb;
        context.fillRect(this.cellPixel * x, this.cellPixel * y, this.cellPixel - 1, this.cellPixel - 1);
    }

    fixBlock() {
        var blockShape = this.blocks[this.blockType].shape;
        for (let i = 0; i < blockShape.length; i++) {
            let displacementX = blockShape[i][0];
            let displacementY = blockShape[i][1];
            this.stage[this.blockX + displacementX][this.blockY + displacementY] = 1;
        }
    }
}

// this.blockX  動かしているブロックの左上のX座標
// this.blockY  動かしているブロックの左上のY座標
// this.stage   10x20の2次元配列
//              1が入っていたらブロックが埋まっている
//              例. if (this.stage[2][3] == 1)
//                  ↑ 座標(2, 3)にブロックがあるかどうかの判定
// this.blocks[0].shape
//              ブロックの形を定義した座標
        //  this.blocks = [
        //     {
        //         shape: [
        //             X座標, Y座標の順
        //             [0, 0], [0, 1], [1, 0], [1, 1]
        //             左上,   左下,    右上,   右下
        //         ]
        //     }
        // ];
