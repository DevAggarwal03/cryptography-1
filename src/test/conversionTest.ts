import { binary64ArrStrToHex, hexTo64BitBinArray, binTo64BitBinArr, toBinary, binToTxt } from "../utils/conversions";

export const testToBin = (str: string) => {
    const temp = toBinary(str);
    console.log(temp);
    const temp1 = binToTxt(temp);
    console.log(temp1);
}

export const testHex = (str: string) => {
    const binStr = toBinary(str); 
    const arr64Bit = binTo64BitBinArr(binStr.split(" ").join(""));
    console.log(arr64Bit);

    let temp = binary64ArrStrToHex(arr64Bit);

    console.log(temp);
    const b = hexTo64BitBinArray(temp);
    console.log(b);
}