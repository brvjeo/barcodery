import utf8 from './utf8.js';
import { toBinary } from './encoder.js';

export class BinaryArray {
    /**
     * Create binary array from text.
     * @param {string} text 
     */
    constructor(text) {
        this._array = [...utf8(text).map(val => toBinary(val, 8)).join('')];
        this._initialArray = this._array.slice(0);
        this.length = this.getLength();
        this.level = 0;
        this.version = 0;
        this.capacity = 0;
        this.blocksAmount = 0;
        this.byteCorrection = 0;

        Object.defineProperties(this,{
            _array:{
                writable:true,
                enumerable:false,
                configurable:false
            },
            _initialArray:{
                writable:true,
                enumerable:false,
                configurable:false
            },
            length:{
                writable:true,
                enumerable:true,
                configurable:false
            },
            level:{
                writable:true,
                enumerable:true,
                configurable:false
            },
            version:{
                writable:true,
                enumerable:true,
                configurable:false
            },
            capacity:{
                writable:true,
                enumerable:true,
                configurable:false
            },
            blocksAmount:{
                writable:true,
                enumerable:true,
                configurable:false
            },
            byteCorrection:{
                writable:true,
                enumerable:true,
                configurable:false
            }
        });
    }
    /**
     * Returns amount of databits associated with version.
     * If 1 <= version <= 9 returns 8.
     * Otherwise returns 16.
    */
    get dataAmount() {
        if (this.version <= 9 && this.version >= 1) {
            return 8;
        } else {
            return 16;
        }
    }
    /**
     * Returns current array.
     */
    getArray() {
        return this._array.slice(0);
    }
    /**
     * Returns initial array.
     */
    getInitialArray(){
        return this._initialArray.slice(0);
    }
    /**
     * Pushes all element from args to the begining.
     * @param {Array} args 
    */
    unshift(args) {
        for(let i = args.length - 1; i >= 0; i--) {
            this._array.unshift(args[i] + "");
        }
        this.length = this.getLength();
    }
    /**
     * Returns first element.
    */
    shift() {
        this.length--;
        return this._array.shift();
    }
    /**
     * Returns last element.
    */
    pop() {
        this.length--;
        return this._array.pop();
    }
    /**
     * Pushes all element from args to the end. 
     * @param {Array} args 
    */
    push(args) {
        for(let i = 0;i < args.length;i++){
            this._array.push(args[i]);
        }
        this.length = this.getLength();
    }
    /**
     * Returns current array length.
    */
    getLength() {
        return this._array.length;
    }
    /**
     * Returns initial array length.
    */
    getInitialLength(){
        return this._initialArray.length;
    }
    /**
     * Reinitializes current array.
    */
    reload(){
        this._array = this._initialArray.slice(0);
    }
    /**
     * Converts binary array to decimal array.
    */
    convertToDecimal(){
        let sum = '';
        for(let i = 0;i < this.length;i++){
            sum += this._array.shift();
            if(((i+1) % 8) == 0){
                this._array.push(parseInt(sum,2));
                sum = '';
            }
        }
        this.length = this.getLength();
    }
    /**
     * Converts decimal array to binary array.
    */
    convertToBinary(){
        for(let i = 0;i < this.length;i++){
            this._array.push(toBinary(this._array.shift(),8));
        }
        this._array = [...this._array.join('')];
        this.length = this.getLength();
    }
}