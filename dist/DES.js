"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESDescryption = exports.binary64strToHex = exports.binary64ArrStrToHex = exports.DESEncryption = exports.testHex = exports.testToBin = void 0;
// import * as c from "cryptojs"
const node_console_1 = require("node:console");
const desSBoxes_1 = require("./desSBoxes");
// PKCS#7 padding for blockSize (8 for DES)
const padPKCS7 = (data, blockSize = 8) => {
    const padLen = blockSize - (data.length % blockSize) || blockSize; // if multiple, padLen = blockSize
    const out = new Uint8Array(data.length + padLen);
    out.set(data, 0);
    out.fill(padLen, data.length); // fill last padLen bytes with value padLen
    return out;
};
const unpadPKCS7 = (data) => {
    if (data.length === 0)
        return data;
    const padLen = data[data.length - 1];
    if (padLen <= 0 || padLen > 8) {
        // invalid padding; return original (or throw)
        console.warn("Invalid PKCS#7 padding detected:", padLen);
        return data;
    }
    // quick sanity check that last padLen bytes equal padLen
    for (let i = data.length - padLen; i < data.length; i++) {
        if (data[i] !== padLen) {
            console.warn("Invalid PKCS#7 padding bytes");
            return data;
        }
    }
    return data.subarray(0, data.length - padLen);
};
const toBinary = (plainTxt) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(plainTxt);
    const padded = padPKCS7(bytes, 8);
    // convert to "01010101 00110011 ..." format
    return Array.from(padded).map(b => b.toString(2).padStart(8, '0')).join(" ");
};
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
const toTxt = (binStr) => {
    if (!binStr || binStr.trim() === "")
        return "";
    const binaryBytes = binStr.trim().split(/\s+/);
    const bytes = Uint8Array.from(binaryBytes.map(b => parseInt(b, 2)));
    const unpadded = unpadPKCS7(bytes);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(unpadded);
};
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
const testToBin = (str) => {
    const temp = toBinary(str);
    console.log(temp);
    const temp1 = toTxt(temp);
    console.log(temp1);
};
exports.testToBin = testToBin;
const testHex = (str) => {
    const binStr = toBinary(str);
    const arr64Bit = make64BitArr(binStr.split(" ").join(""));
    console.log(arr64Bit);
    let temp = (0, exports.binary64ArrStrToHex)(arr64Bit);
    console.log(temp);
    const b = hexTo64BitBinaryArray(temp);
    console.log(b);
};
exports.testHex = testHex;
const permutate = (str, permutationMatrx) => {
    let computedStr = "";
    try {
        for (let i = 0; i < permutationMatrx.length; i++) {
            for (let j = 0; j < permutationMatrx[i].length; j++) {
                if (permutationMatrx[i][j] - 1 >= str.length) {
                    // console.log('index')
                    throw node_console_1.error;
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
// main des encryption function
const DESEncryption = (plainTxt, key) => {
    // xxxxxxxx xxxxxxxx ...
    const binaryPlainTxt = toBinary(plainTxt).split(" ").join("");
    const binaryKeyStr = toBinary(key).split(" ").join("");
    const arr64Plain = make64BitArr(binaryPlainTxt);
    const arr64Key = make64BitArr(binaryKeyStr);
    // console.log("plain txt bin: ", arr64Plain)
    if (arr64Key.length > 1) {
        console.log("key size very big!!");
        return "";
    }
    const initialPermutation = arr64Plain.map((str) => permutate(str, initialPermutationMatrix));
    const keys = genKey(arr64Key);
    const stringsAfter16Rounds = [];
    for (let i = 0; i < initialPermutation.length; i++) {
        let str = initialPermutation[i];
        for (let j = 0; j < 16; j++) {
            let leftPart = str.substring(0, 32);
            let rightPart = str.substring(32, 64);
            const res = encRoundFn(rightPart, keys[j]);
            const xorRes = xorFn(leftPart, res);
            if (xorRes == "") {
                return "";
            }
            if (j < 15) {
                str = rightPart + xorRes;
            }
            else {
                str = xorRes + rightPart;
            }
        }
        stringsAfter16Rounds.push(str);
    }
    const arr64Cipher = stringsAfter16Rounds.map((str) => permutate(str, finalPermutationMatrix));
    const cipherHex = (0, exports.binary64ArrStrToHex)(arr64Cipher);
    return cipherHex;
};
exports.DESEncryption = DESEncryption;
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
// main des decryption function
const DESDescryption = (cipherHex, key) => {
    const binaryKeyStr = toBinary(key).split(" ").join("");
    const cipherTxt = hexTo64BitBinaryArray(cipherHex);
    const initialPermutationArr = cipherTxt.map((str) => permutate(str, initialPermutationMatrix));
    const arr64Key = make64BitArr(binaryKeyStr);
    const keys = genKey(arr64Key);
    const stringsAfter16Rounds = [];
    for (let i = 0; i < initialPermutationArr.length; i++) {
        let str = initialPermutationArr[i];
        for (let j = 0; j < 16; j++) {
            let leftPart = str.substring(0, 32);
            let rightPart = str.substring(32, 64);
            const res = encRoundFn(rightPart, keys[15 - j]);
            const xorRes = xorFn(leftPart, res);
            if (xorRes == "") {
                return "";
            }
            if (j < 15) {
                str = rightPart + xorRes;
            }
            else {
                str = xorRes + rightPart;
            }
        }
        stringsAfter16Rounds.push(str);
    }
    const arr64Plain = stringsAfter16Rounds.map((str) => permutate(str, finalPermutationMatrix));
    const binaryPlainTxt = arr64bitToBinStr(arr64Plain);
    const plainTxt = toTxt(binaryPlainTxt);
    return plainTxt;
};
exports.DESDescryption = DESDescryption;
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
const encRoundFn = (txt, key) => {
    const expansionRes = permutate(txt, expansionPBoxFnMatrix);
    // 48 bits
    const xorRes = xorFn(expansionRes, key);
    // 48 -> 32
    const sBoxRes = (0, desSBoxes_1.sBoxesFn)(xorRes);
    const sPBoxRes = permutate(sBoxRes, desSBoxes_1.straightPBoxEncFnMatrix);
    // result -> 32 bit string
    return sPBoxRes;
};
// used in roundFn
const expansionPBoxFnMatrix = [
    [32, 1, 2, 3, 4, 5],
    [4, 5, 6, 7, 8, 9],
    [8, 9, 10, 11, 12, 13],
    [12, 13, 14, 15, 16, 17],
    [16, 17, 18, 19, 20, 21],
    [20, 21, 22, 23, 24, 25],
    [24, 25, 26, 27, 28, 29],
    [28, 29, 30, 31, 32, 1]
];
const leftShift = (str, num) => {
    return str.substring(num) + str.substring(0, num);
};
const genKey = (seedKey) => {
    // parity drop 64 -> 56
    const eff56bitKeyArr = seedKey.map((str) => permutate(str, parityDropMatrix));
    let eff56bitKey = eff56bitKeyArr[0];
    const roudKeys = [];
    const oneBit = [0, 1, 8, 15];
    for (let i = 0; i < 16; i++) {
        let leftPart = eff56bitKey.substring(0, 28);
        let rightPart = eff56bitKey.substring(28, 56);
        // console.log(i);
        // console.log(eff56bitKey);
        // console.log(leftPart);
        let temp = !oneBit.includes(i) ? (leftShift(leftPart, 2)) : (leftShift(leftPart, 1));
        leftPart = temp;
        // console.log(leftPart, '\n');
        // console.log(rightPart);
        temp = !oneBit.includes(i) ? (leftShift(rightPart, 2)) : (leftShift(rightPart, 1));
        rightPart = temp;
        // console.log(rightPart, '\n');
        // console.log('\n');
        eff56bitKey = leftPart + rightPart;
        // compress 56 -> 48 bits
        const RoundKey = permutate(eff56bitKey, keyCompressionPermutationMatrix);
        roudKeys.push(RoundKey);
    }
    return roudKeys;
};
const keyCompressionPermutationMatrix = [
    [14, 17, 11, 24, 1, 5, 3, 28],
    [15, 6, 21, 10, 23, 19, 12, 4],
    [26, 8, 16, 7, 27, 20, 13, 2],
    [41, 52, 31, 37, 47, 55, 30, 40],
    [51, 45, 33, 48, 44, 49, 39, 56],
    [34, 53, 46, 42, 50, 36, 29, 32]
];
const parityDropMatrix = [
    [57, 49, 41, 33, 25, 17, 9, 1],
    [58, 50, 42, 34, 26, 18, 10, 2],
    [59, 51, 43, 35, 27, 19, 11, 3],
    [60, 52, 44, 36, 63, 55, 47, 39],
    [31, 23, 15, 7, 62, 54, 46, 38],
    [30, 22, 14, 6, 61, 53, 45, 37],
    [29, 21, 13, 5, 28, 20, 12, 4]
];
const initialPermutationMatrix = [
    [58, 50, 42, 34, 26, 18, 10, 2],
    [60, 52, 44, 36, 28, 20, 12, 4],
    [62, 54, 46, 38, 30, 22, 14, 6],
    [64, 56, 48, 40, 32, 24, 16, 8],
    [57, 49, 41, 33, 25, 17, 9, 1],
    [59, 51, 43, 35, 27, 19, 11, 3],
    [61, 53, 45, 37, 29, 21, 13, 5],
    [63, 55, 47, 39, 31, 23, 15, 7]
];
const finalPermutationMatrix = [
    [40, 8, 48, 16, 56, 24, 64, 32],
    [39, 7, 47, 15, 55, 23, 63, 31],
    [38, 6, 46, 14, 54, 22, 62, 30],
    [37, 5, 45, 13, 53, 21, 61, 29],
    [36, 4, 44, 12, 52, 20, 60, 28],
    [35, 3, 43, 11, 51, 19, 59, 27],
    [34, 2, 42, 10, 50, 18, 58, 26],
    [33, 1, 41, 9, 49, 17, 57, 25]
];
