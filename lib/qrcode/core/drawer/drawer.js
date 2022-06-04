export class Drawer {
    /**
     * Create drawing object.
     * @param {Object} props 
     */
    constructor(props) {
        this.pixelSize = 50;
        this.color = props.color ?? "black";
        this.borderType = props.borderType ?? "square";
        this.canvas = props.element;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientWidth;
        this.image = new Image(this.canvas.clientWidth,this.canvas.clientWidth);
    }
    draw(matrix) {
        switch(this.borderType){
            case 'circle':
                this.image.src = this.drawRound(matrix);
                break;
            default:
                this.image.src = this.drawSquare(matrix);
                break;
        }
        
        this.image.onload = () => {
            let context = this.canvas.getContext('2d');

            context.clearRect(0,0,this.canvas.clientWidth,this.canvas.clientHeight);
            context.drawImage(this.image,0,0,this.canvas.clientWidth,this.canvas.clientWidth);
        };
    }

    drawRound(matrix){
        let newCanvas = document.createElement('canvas');

        newCanvas.height = matrix.height * this.pixelSize;
        newCanvas.width = matrix.width * this.pixelSize;

        let ctx = newCanvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        ctx.fillStyle = this.color;

        let corners = null, x = 0, y = 0, bigFinderPos = [], smallFinderPos = [];

        for (let i = 0; i < matrix.width; i++) {
            for (let j = 0; j < matrix.height; j++) {
                corners = [16,16,16,16];
                if (matrix.matrix[i][j] == 1) {
                    if (matrix.matrix[i - 1]?.[j] == 1) {
                        corners[0] = corners[3] = 0;
                    }
                    if (matrix.matrix[i + 1]?.[j] == 1) {
                        corners[1] = corners[2] = 0;
                    }
                    if (matrix.matrix[i][j - 1] == 1) {
                        corners[0] = corners[1] = 0;
                    }
                    if (matrix.matrix[i][j + 1] == 1) {
                        corners[2] = corners[3] = 0;
                    }
                    drawPartialRoundRect(x, y, this.pixelSize, this.pixelSize, corners, 1, this.color, ctx, true);
                }
                if (matrix.matrix[i][j] == 78) {
                    bigFinderPos.push({
                        x: i,
                        y: j
                    });
                }
                if (matrix.matrix[i][j] == 87) {
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

        for(let i = 0;i < bigFinderPos.length;i++){
            let bx = bigFinderPos[i].x * this.pixelSize;
            let by = bigFinderPos[i].y * this.pixelSize;

            drawEntireRoundRect(bx,by,7 * this.pixelSize, 7 * this.pixelSize, 90, 45, this.color, ctx);
        }


        corners = [45, 45, 45, 45];
        for (let i = 0; i < smallFinderPos.length; i++) {
            let sx = smallFinderPos[i].x * this.pixelSize;
            let sy = smallFinderPos[i].y * this.pixelSize;

            drawPartialRoundRect(sx, sy, 3 * this.pixelSize, 3 * this.pixelSize, corners, 1, this.color, ctx, true);
        }
        let dataURL = newCanvas.toDataURL();
        newCanvas.remove();

        return dataURL;
    }
    drawSquare(matrix){
        let newCanvas = document.createElement("canvas");

        newCanvas.height = matrix.height * this.pixelSize;
        newCanvas.width = matrix.width * this.pixelSize;

        let ctx = newCanvas.getContext('2d');

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        ctx.fillStyle = this.color;

        let x = 0, y = 0;
        for (let i = 0; i < matrix.width; i++) {
            for (let j = 0; j < matrix.height; j++) {
                if((matrix.matrix[i][j] != 0) && (matrix.matrix[i][j] != -1)){
                    ctx.fillRect(x,y,this.pixelSize,this.pixelSize);
                }
                y += this.pixelSize;
            }
            x += this.pixelSize;
            y = 0;
        }

        ctx.fillRect((5 + 7 - 1)*this.pixelSize,(5 + 7 - 1)*this.pixelSize,this.pixelSize,this.pixelSize);

        let dataURL = newCanvas.toDataURL();
        newCanvas.remove();

        return dataURL;
    }
}
/**
 * Draws rectangle with some round corners.
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
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = color;
    context.imageSmoothingEnabled = true;
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
    context.lineCap = "round";
    context.lineJoin = "round";
    context.imageSmoothingEnabled = true;

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