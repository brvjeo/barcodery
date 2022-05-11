import {encode} from "./core/encoder/encoder.js";
import {Matrix} from "./core/embedder/embedder.js";

export class QR{
    constructor(selector,props){
        this.text = props.text ?? "No text";
        this.color = props.color ?? 'black';
        this.element = document.querySelector(selector);
        this.matrix = new Matrix(encode(this.text,2));
        this.draw();

    }
    draw(){
        let ctx = this.element.getContext('2d');
        this.element.height = this.matrix.height * 10;
		this.element.width  = this.matrix.width * 10;

        let x = 0,y = 0;
        for(let i = 0;i < this.matrix.width; i++){
            for(let j = 0;j < this.matrix.height; j++){
                if((this.matrix.matrix[i][j] == -1)||(this.matrix.matrix[i][j] == 0)){
                    ctx.fillStyle = 'white';
                }else{
                    ctx.fillStyle = this.color;
                }
                ctx.fillRect(x,y,10,10);
                y += 10;
            }
            x += 10;
            y = 0;
        }
    }
}