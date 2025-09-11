"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leftShift = exports.xorFn = void 0;
const xorFn = (a, b) => {
    if (a.length != b.length) {
        console.log('xor fn length not equal');
        return "";
    }
    let ans = "";
    for (let i = 0; i < a.length; i++) {
        if ((a[i] == '1' && b[i] == '1') || (a[i] == '0' && b[i] == '0')) {
            ans += '0';
        }
        else {
            ans += '1';
        }
    }
    return ans;
};
exports.xorFn = xorFn;
const leftShift = (str, num) => {
    return str.substring(num) + str.substring(0, num);
};
exports.leftShift = leftShift;
