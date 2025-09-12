"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testHex = exports.testToBin = void 0;
const conversions_1 = require("../utils/conversions");
const testToBin = (str) => {
    const temp = (0, conversions_1.toBinary)(str);
    console.log(temp);
    const temp1 = (0, conversions_1.binToTxt)(temp);
    console.log(temp1);
};
exports.testToBin = testToBin;
const testHex = (str) => {
    const binStr = (0, conversions_1.toBinary)(str);
    const arr64Bit = (0, conversions_1.binTo64BitBinArr)(binStr.split(" ").join(""));
    console.log(arr64Bit);
    let temp = (0, conversions_1.binary64ArrStrToHex)(arr64Bit);
    console.log(temp);
    const b = (0, conversions_1.hexTo64BitBinArray)(temp);
    console.log(b);
};
exports.testHex = testHex;
