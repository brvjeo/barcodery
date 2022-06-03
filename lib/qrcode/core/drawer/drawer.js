export class Drawer {
    /**
     * Create drawing object.
     * @param {Matrix} matrix 
     * @param {Object} props 
     */
    constructor(matrix, props) {
        this.pixelSize = 50;
        this.matrix = matrix;
        this.color = props.color ?? "black";
        this.borderType = props.borderType ?? "square";
        this.icon = props.icon ?? "none";
        this.element = props.element;
        this.width = props.width;
        this.embImage = props.image;
        this.image = new Image();
        this.element.width = this.element.height = this.width;
    }
    draw() {
        if(this.borderType == "circle"){
            this.image.src = this.drawRound().toDataURL();
        }else{
            this.image.src = this.drawSquare().toDataURL();
        }

        this.element.getContext('2d').drawImage(this.image, 0, 0, this.element.width, this.element.height);
    }

    drawRound(){
        let newCanvas = document.createElement("canvas");
        newCanvas.height = this.matrix.height * this.pixelSize;
        newCanvas.width = this.matrix.width * this.pixelSize;
        let ctx = newCanvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.fillStyle = this.color;
        ctx.imageSmoothingEnabled = true;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        let corners;

        let x = 0, y = 0, bigFinderPos = [], smallFinderPos = [];
        for (let i = 0; i < this.matrix.width; i++) {
            for (let j = 0; j < this.matrix.height; j++) {
                corners = [16,16,16,16];
                if (this.matrix.matrix[i][j] == 1) {
                    if (this.matrix.matrix[i - 1]?.[j] == 1) {
                        corners[0] = corners[3] = 0;
                    }
                    if (this.matrix.matrix[i + 1]?.[j] == 1) {
                        corners[1] = corners[2] = 0;
                    }
                    if (this.matrix.matrix[i][j - 1] == 1) {
                        corners[0] = corners[1] = 0;
                    }
                    if (this.matrix.matrix[i][j + 1] == 1) {
                        corners[2] = corners[3] = 0;
                    }
                    drawPartialRoundRect(x, y, this.pixelSize, this.pixelSize, corners, 1, this.color, ctx, true);
                }
                if (this.matrix.matrix[i][j] == 78) {
                    bigFinderPos.push({
                        x: i,
                        y: j
                    });
                }
                if (this.matrix.matrix[i][j] == 87) {
                    smallFinderPos.push({
                        x: i,
                        y: j
                    });
                }
                y += this.pixelSize;
            }
            x += this.pixelSize;
            y = 0;
        }
        corners = [90,90,90,90];
        for(let i = 0;i < bigFinderPos.length;i++){
            let bx = bigFinderPos[i].x * this.pixelSize;
            let by = bigFinderPos[i].y * this.pixelSize;

            drawEntireRoundRect(bx,by,7 * this.pixelSize, 7 * this.pixelSize, corners[0], 45, this.color, ctx);
        }


        corners = [45, 45, 45, 45];
        for (let i = 0; i < smallFinderPos.length; i++) {
            let sx = smallFinderPos[i].x * this.pixelSize;
            let sy = smallFinderPos[i].y * this.pixelSize;

            drawPartialRoundRect(sx, sy, 3 * this.pixelSize, 3 * this.pixelSize, corners, 1, this.color, ctx, true);
        }

        return newCanvas;
    }
    drawSquare(){
        let newCanvas = document.createElement("canvas");
        newCanvas.height = this.matrix.height * this.pixelSize;
        newCanvas.width = this.matrix.width * this.pixelSize;
        let ctx = newCanvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.fillStyle = this.color;

        let x = 0, y = 0;
        for (let i = 0; i < this.matrix.width; i++) {
            for (let j = 0; j < this.matrix.height; j++) {
                if((this.matrix.matrix[i][j] != 0) && (this.matrix.matrix[i][j] != -1)){
                    ctx.fillRect(x,y,this.pixelSize,this.pixelSize);
                }
                y += this.pixelSize;
            }
            x += this.pixelSize;
            y = 0;
        }
        ctx.fillRect((5 + 7 - 1)*this.pixelSize,(5 + 7 - 1)*this.pixelSize,this.pixelSize,this.pixelSize);
        return newCanvas;
    }
}
/**
 * Draws rectangle with defined round corners.
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @param {Array} radius 
 * @param {number} lineWidth 
 * @param {string} color 
 * @param {CanvasRenderingContext2D} context 
 * @param {number} fill 
 */
function drawPartialRoundRect(x, y, width, height, radius, lineWidth, color, context, fill) {
    let r = x + width;
    let b = y + height;

    context.beginPath();
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(x + radius[0] - lineWidth / 2, y);
    context.lineTo(r - radius[1] + lineWidth / 2, y);

    context.arcTo(r, y, r, y + radius[1], radius[1]);
    context.lineTo(r, b - radius[2] + lineWidth / 2);

    context.arcTo(r, b, r - radius[2], b, radius[2]);
    context.lineTo(x + radius[3], b);

    context.arcTo(x, b, x, b - radius[3], radius[3]);
    context.lineTo(x, y + radius[0] - lineWidth / 2);

    context.arcTo(x, y, x + radius[0], y, radius[0]);
    context.closePath();
    if (fill) {
        context.fill();
    } else {
        context.stroke();
    }
}
/**
 * Draws rectangle with all round corners.
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @param {number} radius 
 * @param {number} lineWidth 
 * @param {string} color 
 * @param {CanvasRenderingContext2D} context 
 */
function drawEntireRoundRect(x, y, width, height, radius, lineWidth, color,context) {
    var r = x + width;
    var b = y + height;

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(x + radius, y);
    context.lineTo(r - radius, y);
    context.quadraticCurveTo(r, y, r, y + radius);
    context.lineTo(r, y + height - radius);
    context.quadraticCurveTo(r, b, r - radius, b);
    context.lineTo(x + radius, b);
    context.quadraticCurveTo(x, b, x, b - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.stroke();
}