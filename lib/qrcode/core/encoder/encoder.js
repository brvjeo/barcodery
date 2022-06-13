import { FIELDS } from '../fields.js';
import { BinaryArray } from './binaryArray.js';


/**
 * Returns encoded binary array.
 * @param {string} text 
 * @param {number} level 
*/
export function encode(text, level) {
    let binaryArray = new BinaryArray(text);
    let dataBlocks = [], correctionBlocks = [];
    binaryArray.level = level - 1;
    try {
        defineVersion(binaryArray);
        insertTechBytes(binaryArray);
        insertAdditionalBytes(binaryArray);
    }catch(err){
        throw err;
    }
    binaryArray.convertToDecimal();

    if (FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version] > 1) {
        dataBlocks = defineDataBlocks(binaryArray);
    } else {
        dataBlocks.push(binaryArray.getArray());
    }
    binaryArray.blocksAmount = FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version];
    correctionBlocks = defineCorrectionBlocks(binaryArray, dataBlocks);

    combineFinalArray(dataBlocks, correctionBlocks, binaryArray);
    binaryArray.convertToBinary();
    addReminderBits(binaryArray);
    return binaryArray;
}
function addReminderBits(binaryArray) {
    binaryArray.push(new Array(FIELDS.REMAINDER_BITS[binaryArray.version]).fill('0'));
}
function combineFinalArray(dataBlocks, correctionBlocks, binaryArray) {
    let len = binaryArray.length;
    for (let i = 0; i < len; i++) {
        binaryArray.shift();
    }

    for (let i = 0; i < dataBlocks[dataBlocks.length - 1].length; i++) {
        for (let j = 0; j < dataBlocks.length; j++) {
            if (dataBlocks[j].length <= i) {
                continue;
            } else {
                binaryArray.push([dataBlocks[j][i]]);
            }
        }
    }
    for (let i = 0; i < correctionBlocks[correctionBlocks.length - 1].length; i++) {
        for (let j = 0; j < correctionBlocks.length; j++) {
            if (correctionBlocks[j].length <= i) {
                continue;
            } else {
                binaryArray.push([correctionBlocks[j][i]]);
            }
        }
    }
}
function defineDataBlocks(binaryArray) {
    let array = binaryArray.getArray();
    let dataBlocks = [];
    let i = 0;

    let rem = array.length % FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version];
    let amount = Math.floor(array.length / FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version]);

    for (; i < FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version] - rem; i++) {
        dataBlocks.push(multiShift(array, amount));
    }
    for (; i < FIELDS.AMOUNT_OF_BLOCKS[binaryArray.level][binaryArray.version]; i++) {
        dataBlocks.push(multiShift(array, amount + 1));
    }

    return dataBlocks;
}
function defineCorrectionBlocks(binaryArray, dataBlocks) {
    let correctionBlocks = [];
    for (let i = 0; i < binaryArray.blocksAmount; i++) {
        correctionBlocks.push(getCorrectionArray(binaryArray, dataBlocks[i]));
    }
    return correctionBlocks;
}
function getCorrectionArray(binaryArray, dataBlock) {
    let bytesForBlock = FIELDS.BYTES_FOR_SINGLEBLOCK[binaryArray.level][binaryArray.version];
    binaryArray.byteCorrection = bytesForBlock;
    let polynom = FIELDS.POLYNOMICAL_TABLE[bytesForBlock];

    let A = 0, B = 0, C = 0;

    let correctionLength = bytesForBlock > dataBlock.length ? bytesForBlock : dataBlock.length;
    let correctedArray = [];

    for (let i = 0; i < correctionLength; i++) {
        if (i > dataBlock.length - 1) {
            correctedArray.push(0);
        } else {
            correctedArray.push(dataBlock[i]);
        }
    }
    for (let i = 0; i < dataBlock.length; i++) {
        A = correctedArray[0];
        correctedArray.shift();
        if (A == 0) continue;
        B = FIELDS.REVERSED_GALUA_FIELD[A];
        for (let j = 0; j < bytesForBlock; j++) {
            C = polynom[j] + B;
            if (C > 254) {
                C = C % 255;
            }
            correctedArray[j] = (FIELDS.GALUA_FIELD[C] ^ correctedArray[j]);
        }
    }
    return correctedArray.slice(0, bytesForBlock);
}
/**
 * Shift elements from array.
 * @param {Array} array
 * @param {number} amount - Number of shifted elements
 */
function multiShift(array, amount) {
    let result = [];
    for (let i = 0; i < amount; i++) {
        result.push(array.shift());
    }
    return result;
}
function defineLevel() {
    // Only M level available.
    // Others level in future updates.
    return 1;
}
function defineVersion(binaryArray) {
    if(!checkLength(binaryArray)){
        throw new TextLengthError(binaryArray);
    }
    let i = 1;
    while (FIELDS.MAX_INFO_CAPACITY[binaryArray.level][i] <= binaryArray.length) {
        i++;
    }
    binaryArray.capacity = FIELDS.MAX_INFO_CAPACITY[binaryArray.level][i];
    binaryArray.version = i;
}
function checkLength(binaryArray){
    if((FIELDS.MAX_INFO_CAPACITY[binaryArray.level][40] <= binaryArray.length) || !(binaryArray.length)) return false;
    return true;
}
function insertTechBytes(binaryArray) {
    binaryArray.unshift([...(toBinary(binaryArray.length / 8, binaryArray.dataAmount))]);
    binaryArray.unshift(FIELDS.CODE_METHOD);

    binaryArray.length = binaryArray.getLength();
    if(!checkLength(binaryArray)){
        throw new TextLengthError(binaryArray);
    }
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
    binaryArray.length = binaryArray.getLength();
    insertTechBytes(binaryArray);
}
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
    if(!checkLength(binaryArray)){
        throw new TextLengthError(binaryArray);
    }
}
/**
 * Returns binary string with length equals len.
 * @param {number} num 
 * @param {number} len 
*/
export function toBinary(num, len) {
    if (!len) return '';
    return `${'0'.repeat(len - num.toString(2).length)}${num.toString(2)}`;
}


export class EncodingError extends Error {
    constructor(msg) {
        super(msg);
        this.name = this.constructor.name;
    }
}
export class TextLengthError extends EncodingError {
    constructor(binaryArray) {
        super(`Text length error!Current binary length: ${binaryArray.length}. Max binary length: ${FIELDS.MAX_INFO_CAPACITY[binaryArray.level][40]}`);
    }
}