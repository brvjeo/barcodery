import {encode} from "./core/encoder/encoder.js";
import {Matrix} from "./core/embedder/matrix.js";
import {Drawer} from "./core/drawer/drawer.js";

export class QR{
    /**
     * Create QR code object.
     * @param {Element} selector 
     * @param {Object} props 
     */
    constructor(selector,props){
        this.text = props.text ?? "No text";
        this.level = 2; //props.level ?? 2;
        this.element = document.querySelector(selector);
        this.matrix = new Matrix(encode(this.text,this.level));
    }
    draw(props){
        props.element = this.element;
        new Drawer(this.matrix,props).draw();
    }
}