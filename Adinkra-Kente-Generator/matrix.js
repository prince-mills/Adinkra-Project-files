// js/matrix.js

function multiplyMatrices(m1, m2) {
    let result = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                result[i][j] += m1[i][k] * m2[k][j];
            }
        }
    }
    return result;
}

function applyMatrixToPoint(matrix, x, y) {
    let newX = (matrix[0][0] * x) + (matrix[0][1] * y) + (matrix[0][2] * 1);
    let newY = (matrix[1][0] * x) + (matrix[1][1] * y) + (matrix[1][2] * 1);
    return { x: newX, y: newY };
}

function createTranslationMatrix(tx, ty) {
    return [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1]
    ];
}

function createRotationMatrix(angleDegrees) {
    let rad = angleDegrees * (Math.PI / 180);
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    return [
        [cos, -sin, 0],
        [sin,  cos, 0],
        [0,    0,   1]
    ];
}

function createScaleMatrix(sx, sy) {
    return [
        [sx, 0,  0],
        [0,  sy, 0],
        [0,  0,  1]
    ];
}

function createShearMatrix(shx, shy) {
    return [
        [1,   shx, 0],
        [shy, 1,   0],
        [0,   0,   1]
    ];
}