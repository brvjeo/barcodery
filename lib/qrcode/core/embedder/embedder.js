import {FIELDS} from '../fields.js';

export class Embedder{
    /**
     * @param {number} version - Defines code version.
     * @param {number} level - Defines code level.
     */
    constructor(version,level){
        this.version = version;
        this.level = level;
        this.size = FIELDS.MATRIX_SIZE[this.version];
        this.matrix = new Array(this.size);
        for(let i = 0;i < this.size;i++){
            this.matrix.push(new Array(this.size));
        }
    }
    printMatrix(){
        for(let i = 0;i < this.size;i++){
            console.log(this.matrix[i]);
        }
    }
}