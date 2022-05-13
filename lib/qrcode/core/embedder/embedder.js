import { FIELDS } from '../fields.js';

export function embed(matrix) {
    embedTechnicalInfo(matrix);
    embedDataBits(matrix);
    if (matrix.binaryArray.version >= 7) embedVersionCodes(matrix);
    embedFormatCodes(matrix);
}
function embedTechnicalInfo(matrix) {
    embedFinderPatternsAndSeparators(matrix);
    if (matrix.binaryArray.version >= 2) embedAlignmentPatterns(matrix);
    embedSynchronizationLines(matrix);
    embedDarkModule(matrix);
    reserveInfoArea(matrix);
}
function embedDataBits(matrix) {
    let bitIndex = 0;
    let direction = -1;

    let x = matrix.width - 1, y = matrix.height - 1;

    while (x > 0) {
        if (x == 6) {
            x -= 1;
        }
        while (y >= 0 && y < matrix.height) {
            for (let i = 0; i < 2; ++i) {
                let xx = x - i;
                if (!matrix.isEmpty(xx, y)) {
                    continue;
                }
                matrix.matrix[xx][y] = setMask(xx, y, matrix.dataBits[bitIndex]);
                bitIndex++;
            }
            y += direction;
        }
        direction = -direction;
        y += direction;
        x -= 2;
    }
}
function setMask(x, y, module) {
    let mod = 0;
    if ((x + y) % 2 == 0) {
        mod = ((module == 0) ? 1 : 0);
    } else {
        mod = module;
    }
    return mod;
}
function embedVersionCodes(matrix) {
    let codeVersion = FIELDS.VERSION_CODES[matrix.binaryArray.version];
    let index = 0;
    for (let i = 2; i >= 0; i--) {
        for (let j = 0; j < 6; j++) {
            matrix.matrix[j][matrix.width - 9 - i] = (codeVersion[index] == '1' ? 1 : 0);
            matrix.matrix[matrix.height - 9 - i][j] = (codeVersion[index] == '1' ? 1 : 0);
            index++;
        }
    }
}
function embedFormatCodes(matrix) {
    let index = 0;
    //LeftTop
    for (let i = 0; i < 9; i++) {
        if (i == 6) continue;
        matrix.matrix[i][8] = (FIELDS.MASK_PATTERN[matrix.binaryArray.level][index++] == '1') ? 1 : 0;
    }
    for (let i = 7; i >= 0; i--) {
        if (i == 6) continue;
        matrix.matrix[8][i] = (FIELDS.MASK_PATTERN[matrix.binaryArray.level][index++] == '1') ? 1 : 0;
    }
    //
    //LeftBottom + Right Top
    index = 0;
    for (let i = 0; i < 7; i++) {
        matrix.matrix[8][matrix.height - 1 - i] = (FIELDS.MASK_PATTERN[matrix.binaryArray.level][index++] == '1') ? 1 : 0;
    }
    for (let i = 8; i > 0; i--) {
        matrix.matrix[matrix.width - i][8] = (FIELDS.MASK_PATTERN[matrix.binaryArray.level][index++] == '1') ? 1 : 0;
    }
    //
}
function embedFinderPatternsAndSeparators(matrix) {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            //Left Top
            matrix.matrix[i][j] = FIELDS.FINDER_PATTERN[i][j];
            //Right Top
            matrix.matrix[matrix.width - 7 + i][j] = FIELDS.FINDER_PATTERN[i][j];
            //Left Bottom
            matrix.matrix[i][matrix.height - 7 + j] = FIELDS.FINDER_PATTERN[i][j];
        }
    }
    for (let i = 0; i < 8; i++) {
        //Left Top
        matrix.matrix[i][7] = 0;
        matrix.matrix[7][i] = 0;
        //Right Top
        matrix.matrix[matrix.width - 8][i] = 0;
        matrix.matrix[i][matrix.height - 8] = 0;
        //Left Bottom
        matrix.matrix[7][matrix.height - i - 1] = 0;
        matrix.matrix[matrix.width - i - 1][7] = 0;
    }

}
function embedAlignmentPatterns(matrix) {
    let points = [];
    let array = FIELDS.ALIGNMENT_POSITIONS[matrix.binaryArray.version];
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
            if (matrix.matrix[array[i]][array[j]] == -1) {
                points.push({
                    x: array[i],
                    y: array[j]
                });
            }
        }
    }
    let kx = 0, ky = 0, b = 0, a = 0;
    for (let i = 0; i < points.length; i++) {
        a = 0;
        kx = points[i].x - 2;
        ky = points[i].y - 2;
        for (let x = kx; x < kx + 5; x++) {
            b = 0;
            for (let y = ky; y < ky + 5; y++) {
                matrix.matrix[x][y] = FIELDS.ALIGNMENT_PATTERN[a][b];
                b++;
            }
            a++;
        }
    }
}
function embedSynchronizationLines(matrix) {
    let lines = new Array(matrix.height - 14).fill(0);
    for (let i = 0; i < lines.length; i++) {
        if (i % 2 == 0) lines[i] = 1;
    }

    for (let i = 0; i < lines.length; i++) {
        matrix.matrix[6][6 + i] = lines[i];
        matrix.matrix[6 + i][6] = lines[i];
    }
}
function embedDarkModule(matrix) {
    matrix.matrix[8][(4 * matrix.binaryArray.version) + 9] = 1;
}
function reserveInfoArea(matrix) {
    reserveFormatArea(matrix);
    if (matrix.binaryArray.version >= 7) reserveVersionArea(matrix);
}
function reserveFormatArea(matrix) {
    for (let i = 0; i < 9; i++) {
        if (i < 7) {
            matrix.matrix[8][matrix.height - 7 + i] = (matrix.matrix[8][matrix.height - 7 + i] == -1 ? 2 : matrix.matrix[8][matrix.height - 7 + i]);
        }
        if (i < 8) {
            matrix.matrix[matrix.width - i - 1][8] = 2;
            matrix.matrix[8][i] = (matrix.matrix[8][i] == -1 ? 2 : matrix.matrix[8][i]);
        }

        matrix.matrix[i][8] = (matrix.matrix[i][8] == -1 ? 2 : matrix.matrix[i][8]);
    }
}
function reserveVersionArea(matrix) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 6; j++) {
            matrix.matrix[j][matrix.width - 9 - i] = 2;
            matrix.matrix[matrix.height - 9 - i][j] = 2;
        }
    }
}