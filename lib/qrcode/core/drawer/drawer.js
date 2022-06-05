export class Drawer {
    /**
     * Create drawing object.
     * @param {Object} props 
     */
    constructor(props) {
        this.pixelSize = 30;
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
        let cornerSizeSmall = 9;
        let cornerSizeBig = 33;
        let newCanvas = document.createElement("canvas");
        newCanvas.width = matrix.width * this.pixelSize;
        newCanvas.height = matrix.height * this.pixelSize;


        let ctx = newCanvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,newCanvas.width,newCanvas.height);

        let x = 0,y = 0,corners;
        for(let i = 0; i < matrix.width; i++){
            for(let j = 0;j < matrix.height; j++){
                if(matrix.matrix[i][j] == 1){
                    corners = defineCorners(
                        matrix.matrix[i-1]?.[j],
                        matrix.matrix[i+1]?.[j],
                        matrix.matrix[i][j-1],
                        matrix.matrix[i][j+1],
                        cornerSizeSmall);

                    fillRoundedRect(x,y,this.pixelSize,this.pixelSize,corners,this.color,ctx);
                }
                y += this.pixelSize;
            }
            x += this.pixelSize;
            y = 0;
        }
        fillRoundedRect(
            7*this.pixelSize,
            7*this.pixelSize,
            3*this.pixelSize,
            3*this.pixelSize,
            new Array(4).fill(cornerSizeBig),
            this.color,
            ctx
        );
        fillRoundedRect(
            (matrix.width - 10)*this.pixelSize,
            (7)*this.pixelSize,
            3*this.pixelSize,
            3*this.pixelSize,
            new Array(4).fill(cornerSizeBig),
            this.color,
            ctx
        );
        fillRoundedRect(
            (7)*this.pixelSize,
            (matrix.width - 10)*this.pixelSize,
            3*this.pixelSize,
            3*this.pixelSize,
            new Array(4).fill(cornerSizeBig),
            this.color,
            ctx
        );
        fillRoundedRect(
            5*this.pixelSize,
            5*this.pixelSize,
            7*this.pixelSize,
            7*this.pixelSize,
            new Array(4).fill(cornerSizeBig * 2),
            this.color,
            ctx,
            false,
            this.pixelSize
        );
        fillRoundedRect(
            5*this.pixelSize,
            (matrix.height - 12)*this.pixelSize,
            7*this.pixelSize,
            7*this.pixelSize,
            new Array(4).fill(cornerSizeBig * 2),
            this.color,
            ctx,
            false,
            this.pixelSize
        );
        fillRoundedRect(
            (matrix.height - 12)*this.pixelSize,
            5*this.pixelSize,
            7*this.pixelSize,
            7*this.pixelSize,
            new Array(4).fill(cornerSizeBig * 2),
            this.color,
            ctx,
            false,
            this.pixelSize
        );

        return newCanvas.toDataURL();
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
        
        return newCanvas.toDataURL();
    }
}

/**
 * Defines every corner of the module.
 * @param {number} lx 
 * @param {number} rx 
 * @param {number} uy 
 * @param {number} dy 
 * @param {number} angle 
 * @returns 
 */
function defineCorners(lx,rx,uy,dy,angle){
    let corners = new Array(4).fill(angle);

    if((lx != -1)&&(lx != 0)){
        corners[0] = 0;
        corners[3] = 0;
    }
    if((rx != -1)&&(rx != 0)){
        corners[1] = 0;
        corners[2] = 0;
    }
    if((uy != -1)&&(uy != 0)){
        corners[0] = 0;
        corners[1] = 0;
    }
    if((dy != -1)&&(dy != 0)){
        corners[2] = 0;
        corners[3] = 0;
    }

    return corners;
}

/**
 * Draw filled rounded rectangle.
 * @param {number} startX 
 * @param {number} startY 
 * @param {number} rectWidth 
 * @param {number} rectHeight 
 * @param {Array} corners 
 * @param {string} color 
 * @param {CanvasRenderingContext2D} ctx 
 */
 function fillRoundedRect(startX,startY,rectWidth,rectHeight,corners,color,ctx,fill = true,lineWidth = 1){
    corners = corners.map(val => {
        if(val > (Math.min(rectWidth,rectHeight)/2)) return Math.min(rectWidth,rectHeight)/2;
        return val;
    });

    ctx.lineWidth = lineWidth;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(startX + corners[0],startY);
    ctx.lineTo(startX + rectWidth - corners[1],startY);
    ctx.arcTo(startX + rectWidth,startY,startX + rectWidth,startY + corners[1],corners[1]);
    ctx.lineTo(startX + rectWidth,startY + rectHeight - corners[2]);
    ctx.arcTo(startX + rectWidth,startY + rectHeight,startX + rectWidth - corners[2],startY + rectHeight,corners[2]);
    ctx.lineTo(startX + corners[3],startY + rectHeight);
    ctx.arcTo(startX,startY + rectHeight,startX,startY + rectHeight - corners[3],corners[3]);
    ctx.lineTo(startX,startY + corners[0]);
    ctx.arcTo(startX,startY,startX + corners[0],startY,corners[0]);

    if(fill){
        ctx.fill();
    }else{
        ctx.stroke();
    }
}