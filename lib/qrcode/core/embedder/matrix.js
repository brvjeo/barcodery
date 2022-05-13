import {embed} from './embedder.js';
import { FIELDS } from '../fields.js';

export class Matrix {
    /**
     * Create matrix from encoded binary array.
     * @param {BinaryArray} binaryArray 
    */
    constructor(binaryArray) {
        this.matrix = [];
        this.width = FIELDS.MATRIX_SIZE[binaryArray.version];
        this.height = this.width;
        this.binaryArray = binaryArray;
        this.dataBits = this.binaryArray.getArray().map(val => parseInt(val, 10));
        this.fillMatrix();
        embed(this);

        Object.defineProperties(this, {
            matrix: {
                enumerable: false,
                writable: true,
                configurable: false,
            },
            width: {
                configurable: false
            },
            height: {
                configurable: false
            }
        })
    }
    /**
     * Fills matrix with zeroes.
    */
    fillMatrix() {
        for (let i = 0; i < this.height; i++) {
            this.matrix.push(new Array(this.width).fill(-1));
        }
    }
    /**
     * Prints matrix in terminal.
    */
    printMatrix() {
        for (let i = 0; i < this.height; i++) {
            console.log(this.matrix[i].join(''));
        }
    }
    isEmpty(x, y) {
        if (this.matrix[x][y] == -1) return true;
        return false;
    }
}