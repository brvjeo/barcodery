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
        this.level = props.level ?? 2;
        this.element = document.querySelector(selector);
        props.element = this.element;
        this._drawer = new Drawer(props);
    }
    generate(text){
        if(!text){return}
        
        this._drawer.draw(
            new Matrix(encode(text,this.level))
        );
    }
}