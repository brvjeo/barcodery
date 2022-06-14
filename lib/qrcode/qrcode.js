import {encode,EncodingError} from "./core/encoder/encoder.js";
import {Matrix} from "./core/embedder/matrix.js";
import {Drawer} from "./core/drawer/drawer.js";

export class QR{
    /**
     * Create QR code object.
     * @param {Element} selector - Define canvas element for drawing
     * @param {Object} props - Options
     */
    constructor(selector,props){
        this.level = (props.level && props.level <= 4 && props.level >= 1) ? props.level : 2;
        this.element = document.querySelector(selector);
        props.element = this.element;
        this._drawer = new Drawer(props);
    }
    generate(text){
        let binaryArray; 
        
        try{
            binaryArray = encode(text,this.level);
        }catch(err){
            if (err instanceof EncodingError){
                alert(`${err.message}`);
            }
            return;
        }
        this._drawer.draw(new Matrix(binaryArray));
    }
}