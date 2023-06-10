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
            //Oミノ
            {
                shape: [
                    [0, 0], [0, 1], [1, 0], [1, 1]
                ],
                center: [0.5, 0.5],
                color: 'rgb(255, 255, 0)',
            },
            //Iミノ
            {
                shape: [
                    [0, 0], [0, 1], [0, 2], [0, 3]
                ],
                center: [0.5, 1.5],
                color: 'rgb(0, 255, 255)',
            },
            //Tミノ
            {
                shape: [
                    [0, 0], [1, 0], [2, 0], [1, 1]
                ],
                center: [0.5, 0.5],
                color: 'rgb(255, 0, 255)',
            },
            //Zミノ
            {
                shape: [
                    [0, 0], [1, 0], [1, 1], [2, 1]
                ],
                center: [0.5, 0.5],
                color: 'rgb(255, 0, 0)',
            },
            //Sミノ
            {
                shape: [
                    [0, 1], [1, 1], [1, 0], [2, 0]
                ],
                center: [0.5, 0.5],
                color: 'rgb(0, 255, 0)',
            },
            //Jミノ
            {
                shape: [
                    [1, 3], [2, 3], [2, 2], [2, 1]
                ],
                center: [1.5, 1.5],
                color: 'rgb(0, 0, 255)',
            },
            //Lミノ
            {
                shape: [
                    [0, 0], [0, 1], [0, 2], [1, 2]
                ],
                center: [0.5, 0.5],
                color: 'rgb(255, 165, 0)',
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

    rotate(shape, center) {
        shape = shape.map(element => [
            element[0] - center[0],
            element[1] - center[1]
        ]);
        shape = shape.map(element => [
            -element[1],
            element[0]
        ]);
        shape = shape.map(element => [
            element[0] + center[0],
            element[1] + center[1]
        ]);
        return shape;
    }

    deleteLines() {
        let deleteFlags = new Array(this.heightCellCount);
        for (let y = 0; y < this.heightCellCount; y++) {
            // 第y行が埋まっているか判定
            let x;
            for (x = 0; x < this.widthCellCount; x++) {
                if (this.stage[x][y] === null) {
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
                this.blocks[this.blockType].shape = this.rotate(this.blocks[this.blockType].shape, this.blocks[this.blockType].center);
                if (this.isCollided(this.blockType)) {
                    for (let i = 0; i < 2; i++) {
                        this.blocks[this.blockType].shape = this.rotate(this.blocks[this.blockType].shape, this.blocks[this.blockType].center);
                    }
                }
                this.clearStage();
                this.drawBlock();
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
        this.fall()
        this.clearStage();
        this.drawBlock();
    }

    moveRight() {
        this.blockX++;
        if (this.isCollided(this.blockType)) {
            this.blockX--;
        }
        this.clearStage();
        this.drawBlock();
    }

    moveLeft() {
        this.blockX--;
        if (this.isCollided(this.blockType)) {
            this.blockX++;
        }
        this.clearStage();
        this.drawBlock();
    }

    createBlock() {
        // ブロックの初期設定
        this.blockX = this.widthCellCount / 2 - 1;  // X座標
        this.blockY = -1;                            // Y座標
        if (this.stage[this.blockX][this.blockY + 2/* めり込みに対してのとりあえずの処理、後で修正 */] !== null) {
            this.isGameOver = true;
        }
        this.blockType = Math.floor(Math.random() * this.blocks.length);    // ブロックの種類
        this.hasActiveBlock = true;                 // 動かせるブロックが存在するか否か
    }

    fall() {
        this.blockY++;
        if (this.isCollided(this.blockType)) {
            this.blockY--;
            this.isLanding = true;
        }
        this.clearStage();
        this.drawBlock();
    }

    isCollided(minoType) {
        for (let i = 0; i < this.blocks[minoType].shape.length; i++) {
            if (
                this.blockX + this.blocks[minoType].shape[i][0] < 0
                || this.blockX + this.blocks[minoType].shape[i][0] >= this.widthCellCount
                || this.blockY + this.blocks[minoType].shape[i][1] >= this.heightCellCount
                || this.stage[this.blockX + this.blocks[minoType].shape[i][0]][this.blockY + this.blocks[minoType].shape[i][1]] !== null
            ) {
                return true;
            }
        }
        return false;
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
                this.drawCell(canvas, this.blockX + displacementX, this.blockY + displacementY, this.blocks[this.blockType].color);
            }
        } else {
            // 引数を指定したときの処理
            for (let x = 0; x < this.widthCellCount; x++) {
                for (let y = 0; y < this.heightCellCount; y++) {
                    if (this.stage[x][y] !== null) {
                        this.drawCell(canvas, x, y, this.blocks[this.stage[x][y]].color);
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
            this.stage[this.blockX + displacementX][this.blockY + displacementY] = this.blockType;
        }
    }
}