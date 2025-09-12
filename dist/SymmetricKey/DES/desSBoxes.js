"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sBoxesFn = void 0;
const matrix_1 = require("./matrix");
const sBoxMapping = [
    matrix_1.sBox1,
    matrix_1.sBox2,
    matrix_1.sBox3,
    matrix_1.sBox4,
    matrix_1.sBox5,
    matrix_1.sBox6,
    matrix_1.sBox7,
    matrix_1.sBox8
];
const sBoxesFn = (txt) => {
    if (txt.length != 48) {
        console.log("length of string not 48 bits");
        return "";
    }
    let ans = "";
    for (let i = 0; i < 8; i++) {
        const bit6Str = txt.substring(i * 6, i * 6 + 6);
        const rowBin = bit6Str[0] + bit6Str[5];
        const colBin = bit6Str.substring(1, 5);
        // console.log(i, ' ', sBoxMapping[i][parseInt(rowBin, 2)][parseInt(colBin, 2)])
        ans += (sBoxMapping[i][parseInt(rowBin, 2)][parseInt(colBin, 2)]).toString(2).padStart(4, '0');
    }
    return ans;
};
exports.sBoxesFn = sBoxesFn;
