"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESDescryption = exports.DESEncryption = void 0;
const desSBoxes_1 = require("../desSBoxes");
const conversions_1 = require("../../../utils/conversions");
const operations_1 = require("../../../utils/operations");
const matrix_1 = require("../matrix");
// main des encryption function
const DESEncryption = (plainTxt, key) => {
    // xxxxxxxx xxxxxxxx ...
    const binaryPlainTxt = (0, conversions_1.toBinary)(plainTxt);
    const binaryKeyStr = (0, conversions_1.toBinary)(key);
    const arr64Plain = (0, conversions_1.binTo64BitBinArr)(binaryPlainTxt);
    const arr64Key = (0, conversions_1.binTo64BitBinArr)(binaryKeyStr);
    // console.log("plain txt bin: ", arr64Plain)
    if (arr64Key.length > 1) {
        console.log("key size very big!!");
        return "";
    }
    const initialPermutation = arr64Plain.map((str) => (0, conversions_1.permutate)(str, matrix_1.initialPermutationMatrix));
    const keys = genKey(arr64Key);
    const stringsAfter16Rounds = [];
    for (let i = 0; i < initialPermutation.length; i++) {
        let str = initialPermutation[i];
        for (let j = 0; j < 16; j++) {
            let leftPart = str.substring(0, 32);
            let rightPart = str.substring(32, 64);
            const res = encRoundFn(rightPart, keys[j]);
            const xorRes = (0, operations_1.xorFn)(leftPart, res);
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
    const arr64Cipher = stringsAfter16Rounds.map((str) => (0, conversions_1.permutate)(str, matrix_1.finalPermutationMatrix));
    const cipherHex = (0, conversions_1.binary64ArrStrToHex)(arr64Cipher);
    return cipherHex;
};
exports.DESEncryption = DESEncryption;
// main des decryption function
const DESDescryption = (cipherHex, key) => {
    const binaryKeyStr = (0, conversions_1.toBinary)(key);
    const cipherTxt = (0, conversions_1.hexTo64BitBinArray)(cipherHex);
    const initialPermutationArr = cipherTxt.map((str) => (0, conversions_1.permutate)(str, matrix_1.initialPermutationMatrix));
    const arr64Key = (0, conversions_1.binTo64BitBinArr)(binaryKeyStr);
    const keys = genKey(arr64Key);
    const stringsAfter16Rounds = [];
    for (let i = 0; i < initialPermutationArr.length; i++) {
        let str = initialPermutationArr[i];
        for (let j = 0; j < 16; j++) {
            let leftPart = str.substring(0, 32);
            let rightPart = str.substring(32, 64);
            const res = encRoundFn(rightPart, keys[15 - j]);
            const xorRes = (0, operations_1.xorFn)(leftPart, res);
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
    const arr64Plain = stringsAfter16Rounds.map((str) => (0, conversions_1.permutate)(str, matrix_1.finalPermutationMatrix));
    const binaryPlainTxt = (0, conversions_1.bin64bitArrToBinStr)(arr64Plain);
    const plainTxt = (0, conversions_1.binToTxt)(binaryPlainTxt);
    return plainTxt;
};
exports.DESDescryption = DESDescryption;
const encRoundFn = (txt, key) => {
    const expansionRes = (0, conversions_1.permutate)(txt, matrix_1.expansionPBoxFnMatrix);
    // 48 bits
    const xorRes = (0, operations_1.xorFn)(expansionRes, key);
    // 48 -> 32
    const sBoxRes = (0, desSBoxes_1.sBoxesFn)(xorRes);
    const sPBoxRes = (0, conversions_1.permutate)(sBoxRes, matrix_1.straightPBoxEncFnMatrix);
    // result -> 32 bit string
    return sPBoxRes;
};
const genKey = (seedKey) => {
    // parity drop 64 -> 56
    const eff56bitKeyArr = seedKey.map((str) => (0, conversions_1.permutate)(str, matrix_1.parityDropMatrix));
    let eff56bitKey = eff56bitKeyArr[0];
    const roudKeys = [];
    const oneBit = [0, 1, 8, 15];
    for (let i = 0; i < 16; i++) {
        let leftPart = eff56bitKey.substring(0, 28);
        let rightPart = eff56bitKey.substring(28, 56);
        // console.log(i);
        // console.log(eff56bitKey);
        // console.log(leftPart);
        let temp = !oneBit.includes(i) ? ((0, operations_1.leftShift)(leftPart, 2)) : ((0, operations_1.leftShift)(leftPart, 1));
        leftPart = temp;
        // console.log(leftPart, '\n');
        // console.log(rightPart);
        temp = !oneBit.includes(i) ? ((0, operations_1.leftShift)(rightPart, 2)) : ((0, operations_1.leftShift)(rightPart, 1));
        rightPart = temp;
        // console.log(rightPart, '\n');
        // console.log('\n');
        eff56bitKey = leftPart + rightPart;
        // compress 56 -> 48 bits
        const RoundKey = (0, conversions_1.permutate)(eff56bitKey, matrix_1.keyCompressionPermutationMatrix);
        roudKeys.push(RoundKey);
    }
    return roudKeys;
};
