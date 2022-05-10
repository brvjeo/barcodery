import utf8 from './utf8.js';
import { FIELDS } from '../fields.js';

class BinaryArray {
    constructor(text) {
        this._array = [...utf8(text).map(val => toBinary(val, 8)).join('')];
        this._initialArray = this._array.slice(0);
        this.length = this.getLength();
        this.level = 0;
        this.version = 0;
        this.capacity = 0;

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
     * Returns binary array.
     * @returns {Array} array
     */
    getArray() {
        if (this._array == undefined || !this.length) return [];
        return this._array;
    }
    /**
     * Pushes all element from args to the begining.
     * @param {Array} args 
    */
    unshift(args) {
        for(let i = args.length - 1; i >= 0; i--) {
            this._array.unshift(args[i] + "");
        }
    }
    /**
     * Returns first element.
     * @returns {String} elem
     */
    shift() {
        return this._array.shift();
    }
    /**
     * Returns last element.
     * @returns {String} elem
     */
    pop() {
        return this._array.pop();
    }
    /**
     * Pushes all element from args to the end. 
     * @param {Array} args 
     */
    push(args) {
        for (let i in args) {
            this._array.push(i + "");
        }
    }
    /**
     * Returns current array length.
     */
    getLength() {
        return this._array.length;
    }
    /**
     * Reinitializes current array.
     */
    reload(){
        this._array = this._initialArray.slice(0);
    }
}
/**
 * Returns encoded byte array.
 * @param {string} text 
 * @param {number} level 
 * @returns {BinaryArray} binaryArray
*/
export function encode(text, level) {
    let binaryArray = new BinaryArray(text);
    binaryArray.level = level - 1;
    defineVersion(binaryArray);
    insertTechBytes(binaryArray);
    insertAdditionalBytes(binaryArray);
    return binaryArray;
}

/**
 * Returns correction level.
*/
function defineLevel() {
    // Only M level available.
    // Others level in future updates.
    return 1;
}
/**
 * Defines code version.
 * @param {BinaryArray} binaryArray
*/
function defineVersion(binaryArray) {
    let i = 1;
    while (FIELDS.MAX_INFO_CAPACITY[binaryArray.level][i] <= binaryArray.length) {
        i++;
    }
    binaryArray.capacity = FIELDS.MAX_INFO_CAPACITY[binaryArray.level][i];
    binaryArray.version = i;
}
/**
 * Inserts technical information (length,encoding method...).
 * @param {BinaryArray} binaryArray
*/
function insertTechBytes(binaryArray) {
    binaryArray.unshift([...(toBinary(binaryArray.length / 8, binaryArray.dataAmount))]);
    binaryArray.unshift(FIELDS.CODE_METHOD);

    binaryArray.length = binaryArray.getLength();
    if (binaryArray.length > binaryArray.capacity) {
        updateVersion(binaryArray);
    }
}
/**
 * If bytearray length > current capacity, increase version.
 * @param {BinaryArray} binaryArray
*/
function updateVersion(binaryArray) {
    binaryArray.version++;
    while (FIELDS.MAX_INFO_CAPACITY[binaryArray.level][binaryArray.version] < binaryArray.length) {
        binaryArray.version++;
    }
    binaryArray.capacity = FIELDS.MAX_INFO_CAPACITY[binaryArray.level][binaryArray.version];
    binaryArray.reload();
    this.length = binaryArray.getLength();
    insertTechBytes(binaryArray);
}
/**
 * Inserts additional bytes.
 * @param {BinaryArray} binaryArray
*/
function insertAdditionalBytes(binaryArray) {
    /**
     * Fill zeroes.
     */
    if (binaryArray.length % 8) {
        binaryArray.push([...'0'.repeat(8 - binaryArray.length % 8)]);
        binaryArray.length = binaryArray.getLength();
    }
    while (binaryArray.length < binaryArray.capacity) {
        if (binaryArray.length < binaryArray.capacity) {
            binaryArray.push(FIELDS.ADD_BYTE_1);
            binaryArray.length = binaryArray.getLength();
        } else {
            break;
        }
        if (binaryArray.length < binaryArray.capacity) {
            binaryArray.push(FIELDS.ADD_BYTE_2);
            binaryArray.length = binaryArray.getLength();
        } else {
            break;
        }
    }
}
/**
 * Returns binary string with length equals len.
 * @param {number} num 
 * @param {number} len 
 */
function toBinary(num, len) {
    if (!len) return '';
    return `${'0'.repeat(len - num.toString(2).length)}${num.toString(2)}`;
}
