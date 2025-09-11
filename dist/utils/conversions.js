"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binary64strToHex = exports.binary64ArrStrToHex = exports.permutate = exports.arr64bitToBinStr = exports.make64BitArr = exports.toTxt = exports.hexTo64BitBinaryArray = exports.toBinary = void 0;
const helperFunctions_1 = require("../SymmetricKey/dataEcryptionStandard/helperFunctions");
const toBinary = (plainTxt) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(plainTxt);
    const padded = (0, helperFunctions_1.padPKCS7)(bytes, 8);
    // convert to "01010101 00110011 ..." format
    return Array.from(padded).map(b => b.toString(2).padStart(8, '0')).join("");
};
exports.toBinary = toBinary;
const hexTo64BitBinaryArray = (hex) => {
    // assume hex length multiple of 16 (8 bytes per block)
    const blocks = [];
    for (let i = 0; i < hex.length; i += 16) {
        const blockHex = hex.substring(i, i + 16);
        const bytes = [];
        for (let j = 0; j < 16; j += 2) {
            const byteHex = blockHex.substring(j, j + 2);
            const b = parseInt(byteHex, 16);
            bytes.push(b.toString(2).padStart(8, '0'));
        }
        blocks.push(bytes.join(""));
    }
    return blocks; // ["01010101 ...", ...]
};
exports.hexTo64BitBinaryArray = hexTo64BitBinaryArray;
const toTxt = (binStr) => {
    if (!binStr || binStr.trim() === "")
        return "";
    const binaryBytes = binStr.trim().split(/\s+/);
    const bytes = Uint8Array.from(binaryBytes.map(b => parseInt(b, 2)));
    const unpadded = (0, helperFunctions_1.unpadPKCS7)(bytes);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(unpadded);
};
exports.toTxt = toTxt;
const make64BitArr = (binaryStr) => {
    if (binaryStr == "") {
        return [];
    }
    let arr = [];
    let tempStr = "";
    for (let i = 0; i < binaryStr.length; i++) {
        if (i % 64 == 0 && i != 0) {
            arr.push(tempStr);
            tempStr = "";
        }
        tempStr += binaryStr[i];
    }
    if (tempStr != "") {
        arr.push(tempStr.padStart(64, '0'));
    }
    ;
    return arr;
};
exports.make64BitArr = make64BitArr;
const arr64bitToBinStr = (binaryStrArr) => {
    let ans = [];
    for (let i = 0; i < binaryStrArr.length; i++) {
        for (let j = 0; j < 8; j++) {
            ans.push(binaryStrArr[i].substring(j * 8, j * 8 + 8));
        }
    }
    // xxxxxxxx xxxxxxxx ...
    return ans.join(" ");
};
exports.arr64bitToBinStr = arr64bitToBinStr;
const permutate = (str, permutationMatrx) => {
    let computedStr = "";
    try {
        for (let i = 0; i < permutationMatrx.length; i++) {
            for (let j = 0; j < permutationMatrx[i].length; j++) {
                if (permutationMatrx[i][j] - 1 >= str.length) {
                    // console.log('index')
                    throw new Error("index error!");
                }
                computedStr += str[permutationMatrx[i][j] - 1];
            }
        }
        // console.log(computedStr);
        return computedStr;
    }
    catch (error) {
        console.log("can be index error in permutate fun");
        console.log(error);
        return "";
    }
};
exports.permutate = permutate;
const binary64ArrStrToHex = (strArr) => {
    let temp = "";
    strArr.forEach((str) => {
        temp += (0, exports.binary64strToHex)(str);
    });
    return temp;
};
exports.binary64ArrStrToHex = binary64ArrStrToHex;
const binary64strToHex = (str) => {
    let ans = "";
    for (let i = 0; i < 64; i += 4) {
        const tempStr = str.substring(i, i + 4);
        const decimal = parseInt(tempStr, 2);
        ans += decimal.toString(16);
    }
    return ans;
};
exports.binary64strToHex = binary64strToHex;
