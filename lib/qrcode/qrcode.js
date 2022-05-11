import {encode} from "./core/encoder/encoder.js";

export class QR{
    constructor(text){
        this.text = text;
    }
    create(){
        let binaryArray = encode(this.text,2);
    }
}