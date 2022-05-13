export class Drawer {
    /**
     * Create drawing object.
     * @param {Matrix} matrix 
     * @param {Object} props 
     */
    constructor(matrix, props) {
        this.matrix = matrix;
        this.color = props.color ?? "black";
        this.borderType = props.borderType ?? "square";
        this.icon = props.icon ?? "none";
        this.element = props.element;
    }
    draw(){
        switch(this.borderType){
            case "square":
                this.drawSquare();
                break;
            case "round":
                this.drawRound();
                break;
            default:
                this.drawSquare();
                break;
        }
    }
    drawSquare() {
        let ctx = this.element.getContext('2d');
        this.element.height = this.matrix.height * 10;
        this.element.width = this.matrix.width * 10;

        let x = 0, y = 0;
        for (let i = 0; i < this.matrix.width; i++) {
            for (let j = 0; j < this.matrix.height; j++) {
                if ((this.matrix.matrix[i][j] == -1) || (this.matrix.matrix[i][j] == 0)) {
                    ctx.fillStyle = 'white';
                } else {
                    ctx.fillStyle = this.color;
                }
                ctx.fillRect(x, y, 10, 10);
                y += 10;
            }
            x += 10;
            y = 0;
        }
    }
    drawRound(){}
}