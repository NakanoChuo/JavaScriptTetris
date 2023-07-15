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

        //▽next描画用　2023/07/01修正　tak-4649
        this.nextBlockCount = 4;
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
                    [0, 1], [1, 1], [2, 1], [3, 1]
                ],
                center: [1.5, 0.5],
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
                    [0, 0], [0, 1], [1, 1], [2, 1]
                ],
                center: [1.0, 1.0],
                color: 'rgb(0, 0, 255)',
            },
            //Lミノ
            {
                shape: [
                    [0, 1], [0, 0], [1, 0], [2, 0]
                ],
                center: [1.0, 1.0],
                color: 'rgb(255, 165, 0)',
            },
        ];
        //△next描画用　2023/07/01修正　tak-4649

        this.fallSpeed = 500;
        this.count = 0;

        document.addEventListener('keydown', this.keydown.bind(this));
    }

    gamestart() {
        this.deleteLineCount = 0;
        this.hasActiveBlock = false;
        this.isLanding = false;
        this.isGameOver = false;
        //▽hold描画用　2023/07/08作成　tak-4649
        this.hasHoldBlock = false;
        //△hold描画用　2023/07/08作成　tak-4649
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
        //this.clearStage();  // 画面を消す
        this.drawStageBlock();   // ブロックの描画
        //▽next描画用　2023/06/25追加　tak-4649
        this.drawNextBlock();
        //△next描画用　2023/06/25追加　tak-4649
        if (this.isLanding) {   // ブロックが着地したとき
            this.hasActiveBlock = false;
            this.fixBlock(); // ブロックを固定する（配列を保存する）
            this.deleteLineCount += this.deleteLines();
            document.getElementById('lines').innerHTML = this.deleteLineCount;
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
        let deleteLineCount = 0;
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
                deleteLineCount++;
            }
        }
        return deleteLineCount;
    }

    keydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.copyblocks = this.rotate(this.copyblocks, this.blocks[this.blockType].center);
                if (this.isCollided(this.blockType)) {
                    for (let i = 0; i < 3; i++) {
                        this.copyblocks = this.rotate(this.copyblocks, this.blocks[this.blockType].center);
                    }
                }
                this.clearStage();
                this.drawStageBlock();
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
            //▽hold描画用　2023/07/15修正　tak-4649
            case 'Escape':
                if (this.hasHoldBlock) {
                    var i = this.holdblockType;
                    this.holdblockType = this.blockType;
                    this.blockType = i;
                    this.copyBlocks(this.blockType, this.copyblocks);
                    this.clearStage();
                    this.drawStageBlock();
                    this.drawHoldtBlock();
                } else {
                    this.holdblockType = this.blockType;
                    this.hasActiveBlock = false;
                    this.hasHoldBlock = true;
                    this.clearStage();
                    this.drawHoldtBlock();
                }
                break;
            //△hold描画用　2023/07/15修正　tak-4649
        }
    }

    moveDown() {
        this.fall()
        this.clearStage();
        this.drawStageBlock();
    }

    moveRight() {
        this.blockX++;
        if (this.isCollided(this.blockType)) {
            this.blockX--;
        }
        this.clearStage();
        this.drawStageBlock();
    }

    moveLeft() {
        this.blockX--;
        if (this.isCollided(this.blockType)) {
            this.blockX++;
        }
        this.clearStage();
        this.drawStageBlock();
    }

    createBlock() {
        // ブロックの初期設定
        this.blockX = this.widthCellCount / 2 - 1;  // X座標
        this.blockY = -2;                            // Y座標
        //▽next描画用　2023/06/25追加　tak-4649
        if (this.nextblockType === undefined) {
            this.blockType = Math.floor(Math.random() * this.blocks.length);    // ブロックの種類
            this.nextblockType = new Array(this.nextBlockCount);
            for (let i = 0; i < this.nextBlockCount; i++) {
                this.nextblockType[i] = Math.floor(Math.random() * this.blocks.length);
            }
        } else {
            this.blockType = this.nextblockType[0];
            for (let i = 0; i < this.nextBlockCount - 1; i++) {
                this.nextblockType[i] = this.nextblockType[i + 1];
            }
            this.nextblockType[this.nextBlockCount - 1] = Math.floor(Math.random() * this.blocks.length);
        }
        //△next描画用　2023/06/25追加　tak-4649
        this.hasActiveBlock = true;                 // 動かせるブロックが存在するか否か

        //コピー先の配列を作る（shape数分の大きさにする,1次元配列）
        this.copyblocks = new Array(this.blocks[this.blockType].shape.length);
        this.copyBlocks(this.blockType, this.copyblocks);

        //1マス下に移動してゲームオーバー判定
        this.blockY++
        if (this.isCollided(this.blockType)) {
            this.isGameOver = true;
        }
        this.blockY--

        this.hasActiveBlock = true;                 // 動かせるブロックが存在するか否か
    }

    //▽リファクタリング　2023/07/15追加　tak-4649
    copyBlocks(blocktype, blocks) {
        // //要素の[x, y]の数だけ新しい配列を作って2次元配列にする
        for (let i = 0; i < blocks.length; i++) {
            //空の2次元配列
            blocks[i] = new Array(this.blocks[blocktype].shape[i].length);
            //コピーする
            for (let j = 0; j < blocks[i].length; j++) {
                blocks[i][j] = this.blocks[blocktype].shape[i][j];
            };
        };
    }
    //△リファクタリング　2023/07/15追加　tak-4649

    fall() {
        this.blockY++;
        if (this.isCollided(this.blockType)) {
            this.blockY--;
            this.isLanding = true;
        }
        this.clearStage();
        this.drawStageBlock();
    }

    isCollided(minoType) {
        for (let i = 0; i < this.copyblocks.length; i++) {
            if (this.blockY + this.copyblocks[i][1] < 0) {
                continue;
            }
            if (
                this.blockX + this.copyblocks[i][0] < 0
                || this.blockX + this.copyblocks[i][0] >= this.widthCellCount
                || this.blockY + this.copyblocks[i][1] >= this.heightCellCount
                || this.stage[this.blockX + this.copyblocks[i][0]][this.blockY + this.copyblocks[i][1]] !== null
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
        this.drawStageBlock(this.stage);
    }

    drawStageBlock(stage) {
        const canvas = document.getElementById('stage');
        if (stage === undefined) {
            // 引数なしの時の処理
            var blockShape = this.copyblocks;
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

    //▽next描画用　2023/07/01修正　tak-4649
    drawNextBlock() {
        const canvas = document.getElementById('next');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.nextblockType.length; i++) {
            var blockShape = this.blocks[this.nextblockType[i]].shape;
            for (let j = 0; j < blockShape.length; j++) {
                let displacementX = blockShape[j][0];
                let displacementY = blockShape[j][1];
                this.drawCell(canvas, 1 + displacementX, 1 + i * 3 + displacementY, this.blocks[this.nextblockType[i]].color);
            }
        }
    }
    //△next描画用　2023/07/01修正　tak-4649

    //▽hold描画用　2023/07/08作成　tak-4649
    drawHoldtBlock() {
        const canvas = document.getElementById('hold');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (!this.hasHoldBlock) {
            this.holdblockType = this.blockType;
        }
        this.holdblocks = new Array(this.blocks[this.holdblockType].shape.length);
        this.copyBlocks(this.holdblockType, this.holdblocks);

        //描画処理
        for (let i = 0; i < this.holdblocks.length; i++) {
            let displacementX = this.holdblocks[i][0];
            let displacementY = this.holdblocks[i][1];
            this.drawCell(canvas, 1 + displacementX, 1 + displacementY, this.blocks[this.holdblockType].color);
        }
    }
    //△hold描画用　2023/07/08作成　tak-4649

    drawCell(canvas, x, y, rgb) {
        const context = canvas.getContext('2d');
        context.fillStyle = rgb;
        context.fillRect(this.cellPixel * x, this.cellPixel * y, this.cellPixel - 1, this.cellPixel - 1);
    }

    fixBlock() {
        var blockShape = this.copyblocks;
        for (let i = 0; i < blockShape.length; i++) {
            let displacementX = blockShape[i][0];
            let displacementY = blockShape[i][1];
            this.stage[this.blockX + displacementX][this.blockY + displacementY] = this.blockType;
        }
    }
}