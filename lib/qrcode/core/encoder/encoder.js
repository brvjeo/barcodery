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
     * @returns {Array} array
     */
    getArray() {
        return this._array.slice(0);
    }
    /**
     * Returns initial array.
     * @returns {Array} array
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
/**
 * Returns encoded binary array.
 * @param {string} text 
 * @param {number} level 
 * @returns {BinaryArray} binaryArray
*/
export function encode(text, level) {
    let binaryArray = new BinaryArray(text);
    let dataBlocks = [],correctionBlocks = [];
    binaryArray.level = level - 1;
    defineVersion(binaryArray);
    insertTechBytes(binaryArray);
    insertAdditionalBytes(binaryArray);
    binaryArray.convertToDecimal();

    if(FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version] > 1){
        dataBlocks = defineDataBlocks(binaryArray);
    }else{
        dataBlocks.push(binaryArray.getArray());
    }
    binaryArray.blocksAmount = FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version];
    correctionBlocks = defineCorrectionBlocks(binaryArray,dataBlocks);

    combineFinalArray(dataBlocks,correctionBlocks,binaryArray);
    binaryArray.convertToBinary();
    addReminderBits(binaryArray);
    return binaryArray;
}
/**
 * Add reminder bits to binary array.
 * @param {BinaryArray} binaryArray 
 */
function addReminderBits(binaryArray){
    binaryArray.push(new Array(FIELDS.REMAINDER_BITS[binaryArray.version]).fill('0'));
}
/**
 * Combines data and correction blocks.
 * @param {Array} dataBlocks 
 * @param {Array} correctionBlocks 
 * @param {BinaryArray} binaryArray
*/
function combineFinalArray(dataBlocks,correctionBlocks,binaryArray){
    let len = binaryArray.length;
    for(let i = 0;i < len;i++){
        binaryArray.shift();
    }

    for(let i = 0; i < dataBlocks[dataBlocks.length - 1].length; i++){
        for(let j = 0; j < dataBlocks.length; j++){
            if (dataBlocks[j].length <= i){
                continue;
            }else{
                binaryArray.push([dataBlocks[j][i]]);
            }
        }
    }
    for (let i = 0; i < correctionBlocks[correctionBlocks.length - 1].length; i++){
        for (let j = 0; j < correctionBlocks.length; j++){
            if (correctionBlocks[j].length <= i){
                continue;
            }else{
                binaryArray.push([correctionBlocks[j][i]]);
            }
        }
    }
}
/**
 * Returns data blocks.
 * @param {Array} dataBlocks
 */
function defineDataBlocks(binaryArray){
    let array = binaryArray.getArray();
    let dataBlocks = [];
    let i = 0;

    let rem = array.length % FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version];
    let amount = Math.floor(array.length / FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version]);

    for(;i < FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version] - rem;i++){
        dataBlocks.push(multiShift(array,amount));
    }
    for(;i < FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version];i++){
        dataBlocks.push(multiShift(array,amount+1));
    }

    return dataBlocks;
}
/**
 * Returns byte correction blocks.
 * @param {BinaryArray} binaryArray
 * @param {Array} dataBlocks
*/
function defineCorrectionBlocks(binaryArray,dataBlocks){
    let correctionBlocks = [];
    for(let i = 0;i < binaryArray.blocksAmount;i++){
        correctionBlocks.push(getCorrectionArray(binaryArray,dataBlocks[i]));
    }
    return correctionBlocks;
}
/**
 * Generate correction array.
 * @param {BinaryArray} binaryArray 
 * @param {Array} dataBlock
 */
function getCorrectionArray(binaryArray,dataBlock){
    let bytesForBlock = FIELDS.BYTES_FOR_SINGLEBLOCK[binaryArray.level][binaryArray.version];
    binaryArray.byteCorrection = bytesForBlock;
    let polynom = FIELDS.POLYNOMICAL_TABLE[bytesForBlock];

    let A = 0,B = 0,C = 0;

    let correctionLength = bytesForBlock > dataBlock.length ? bytesForBlock : dataBlock.length;
    let correctedArray = [];

    for (let i = 0; i < correctionLength; i++){
        if(i > dataBlock.length - 1){
            correctedArray.push(0);
        }else{
            correctedArray.push(dataBlock[i]);
        }
    }
    for(let i = 0;i < dataBlock.length;i++){
        A = correctedArray[0];
        correctedArray.shift();
        if(A == 0) continue;
        B = FIELDS.REVERSED_GALUA_FIELD[A];
        for(let j = 0;j < bytesForBlock;j++){
            C = polynom[j] + B;
            if(C > 254){
                C = C % 255;
            }
            correctedArray[j] = (FIELDS.GALUA_FIELD[C] ^ correctedArray[j]);
        }
    }
    return correctedArray.slice(0,bytesForBlock);
}
/**
 * Shift elements from array.
 * @param {Array} array
 * @param {number} amount - Number of shifted elements
 */
function multiShift(array,amount){
    let result = [];
    for(let i = 0;i < amount;i++){
        result.push(array.shift());
    }
    return result;
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
