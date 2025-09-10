// import * as c from "cryptojs"
import { error } from "node:console";
import { sBoxesFn, straightPBoxEncFnMatrix } from "./desSBoxes";

// PKCS#7 padding for blockSize (8 for DES)
const padPKCS7 = (data: Uint8Array, blockSize = 8): Uint8Array => {
    const padLen = blockSize - (data.length % blockSize) || blockSize; // if multiple, padLen = blockSize
    const out = new Uint8Array(data.length + padLen);
    out.set(data, 0);
    out.fill(padLen, data.length); // fill last padLen bytes with value padLen
    return out;
};

const unpadPKCS7 = (data: Uint8Array): Uint8Array => {
    if (data.length === 0) return data;
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


const toBinary = (plainTxt: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(plainTxt);
    const padded = padPKCS7(bytes, 8); 

    // convert to "01010101 00110011 ..." format
    return Array.from(padded).map(b => b.toString(2).padStart(8, '0')).join(" ");
}

const hexTo64BitBinaryArray = (hex: string): string[] => {
    // assume hex length multiple of 16 (8 bytes per block)
    const blocks: string[] = [];
    for (let i = 0; i < hex.length; i += 16) {
        const blockHex = hex.substring(i, i + 16);
        const bytes: string[] = [];
        for (let j = 0; j < 16; j += 2) {
            const byteHex = blockHex.substring(j, j + 2);
            const b = parseInt(byteHex, 16);
            bytes.push(b.toString(2).padStart(8, '0'));
        }
        blocks.push(bytes.join(""));
    }
    return blocks; // ["01010101 ...", ...]
}

const toTxt = (binStr: string): string => {
    if (!binStr || binStr.trim() === "") return "";
    const binaryBytes = binStr.trim().split(/\s+/);
    const bytes = Uint8Array.from(binaryBytes.map(b => parseInt(b, 2)));
    const unpadded = unpadPKCS7(bytes);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(unpadded);
}

const make64BitArr = (binaryStr: string): string[] => {
    if(binaryStr == ""){
        return [];
    }
    let arr: string[] = [];
    let tempStr: string = "";
    for(let i=0; i<binaryStr.length; i++){
        if(i % 64 == 0 && i != 0){
            arr.push(tempStr);
            tempStr = "";
        }
        tempStr += binaryStr[i];
    }
    if(tempStr != ""){
        arr.push(tempStr.padStart(64, '0'));
    };
    return arr! 
}

const arr64bitToBinStr = (binaryStrArr: string[]): string => {
    let ans: string[] = [];
    for(let i=0; i<binaryStrArr.length; i++){
        for(let j=0; j<8; j++){
            ans.push(binaryStrArr[i].substring(j*8, j*8 + 8));
        }
    }

    // xxxxxxxx xxxxxxxx ...
    return ans.join(" "); 
}

export const testToBin = (str: string) => {
    const temp = toBinary(str);
    console.log(temp);
    const temp1 = toTxt(temp);
    console.log(temp1);
}

export const testHex = (str: string) => {
    const binStr = toBinary(str); 
    const arr64Bit = make64BitArr(binStr.split(" ").join(""));
    console.log(arr64Bit);

    let temp = binary64ArrStrToHex(arr64Bit);

    console.log(temp);
    const b = hexTo64BitBinaryArray(temp);
    console.log(b);
}

const permutate = (str: string, permutationMatrx: number[][]) => {
    let computedStr: string = "";
    try {
        for(let i=0; i<permutationMatrx.length; i++){
            for(let j=0; j<permutationMatrx[i].length; j++){
                if(permutationMatrx[i][j] - 1 >= str.length){
                    // console.log('index')
                    throw error 
                }
                computedStr += str[permutationMatrx[i][j] - 1];
            }
        }
        // console.log(computedStr);
        return computedStr;   
    } catch (error) {
        console.log("can be index error in permutate fun");
        console.log(error);
        return ""
    }
    
}

// main des encryption function
export const DESEncryption = (plainTxt: string, key: string): string => {
    // xxxxxxxx xxxxxxxx ...
    const binaryPlainTxt = toBinary(plainTxt).split(" ").join("");
    const binaryKeyStr = toBinary(key).split(" ").join("");

    const arr64Plain : string[] = make64BitArr(binaryPlainTxt);
    const arr64Key : string[] = make64BitArr(binaryKeyStr);

    // console.log("plain txt bin: ", arr64Plain)

    if(arr64Key.length > 1){
        console.log("key size very big!!");
        return "";
    }

    const initialPermutation: string[] = arr64Plain.map((str:string) => permutate(str, initialPermutationMatrix));
    const keys: string[] = genKey(arr64Key);
    
    const stringsAfter16Rounds: string[] = []
    for(let i=0; i<initialPermutation.length; i++){
        let str: string = initialPermutation[i];
        for(let j=0; j<16; j++){
            let leftPart = str.substring(0,  32);
            let rightPart = str.substring(32, 64);

            const res = encRoundFn(rightPart, keys[j]);
            const xorRes = xorFn(leftPart, res);

            if(xorRes == ""){
                return "";
            }
            
            if (j < 15) {
                str = rightPart + xorRes;
            } else {
                str = xorRes + rightPart;
            }
        }
        stringsAfter16Rounds.push(str);
    }
    
    const arr64Cipher = stringsAfter16Rounds.map((str:string) => permutate(str, finalPermutationMatrix));

    const cipherHex: string = binary64ArrStrToHex(arr64Cipher);
    
    return cipherHex;
}

export const binary64ArrStrToHex = (strArr: string[]) => {
    let temp = "";
    strArr.forEach((str: string) => {
        temp += binary64strToHex(str);
    })

    return temp;
}

export const binary64strToHex = (str: string) => {
    let ans: string = "";
    for(let i=0; i<64; i+=4){
        const tempStr = str.substring(i, i+4);
        const decimal = parseInt(tempStr, 2);
        ans += decimal.toString(16);
    }
    return ans;
}


// main des decryption function
export const DESDescryption = (cipherHex: string, key: string): string => {
    const binaryKeyStr = toBinary(key).split(" ").join("");
    const cipherTxt: string[] = hexTo64BitBinaryArray(cipherHex);
    const initialPermutationArr = cipherTxt.map((str:string) => permutate(str, initialPermutationMatrix));
    const arr64Key : string[] = make64BitArr(binaryKeyStr);
    const keys: string[] = genKey(arr64Key);
    
    const stringsAfter16Rounds: string[] = []
    for(let i=0; i<initialPermutationArr.length; i++){
        let str: string = initialPermutationArr[i];
        for(let j=0; j<16; j++){
            let leftPart = str.substring(0,  32);
            let rightPart = str.substring(32, 64);

            const res = encRoundFn(rightPart, keys[15 - j]);
            const xorRes = xorFn(leftPart, res);

            if(xorRes == ""){
                return "";
            }
            
            if (j < 15) {
                str = rightPart + xorRes;
            } else {
                str = xorRes + rightPart;
            }
        }
        stringsAfter16Rounds.push(str);
    }
    
    const arr64Plain = stringsAfter16Rounds.map((str:string) => permutate(str, finalPermutationMatrix));

    const binaryPlainTxt = arr64bitToBinStr(arr64Plain);
    const plainTxt = toTxt(binaryPlainTxt);

    return plainTxt; 
}

const xorFn = (a: string, b: string): string => {
    if(a.length != b.length){
        console.log('xor fn length not equal');
        return "";
    }
    let ans = "";
    for(let i=0; i<a.length; i++){
        if((a[i] == '1' && b[i] == '1') || (a[i] == '0' && b[i] == '0')){
            ans += '0';
        }else{
            ans += '1';
        }
    }
    return ans; 
}

const encRoundFn = (txt: string, key: string): string => {

    const expansionRes = permutate(txt, expansionPBoxFnMatrix);
    // 48 bits
    const xorRes = xorFn(expansionRes, key);
   
    // 48 -> 32
    const sBoxRes = sBoxesFn(xorRes);
   
    const sPBoxRes = permutate(sBoxRes, straightPBoxEncFnMatrix);

    // result -> 32 bit string
    return sPBoxRes; 
}

// used in roundFn
const expansionPBoxFnMatrix: number[][] = [
    [32, 1, 2, 3, 4, 5],
    [4, 5, 6, 7, 8, 9],
    [8, 9, 10, 11, 12, 13],
    [12, 13, 14, 15, 16, 17],
    [16, 17, 18, 19, 20, 21],
    [20, 21, 22, 23, 24, 25],
    [24, 25, 26, 27, 28, 29],
    [28, 29, 30, 31, 32, 1]
];

const leftShift = (str: string, num: number) => {
    return str.substring(num) + str.substring(0, num);
}

const genKey = (seedKey: string[]): string[] => {
    // parity drop 64 -> 56
    const eff56bitKeyArr: string[] = seedKey.map((str: string) => permutate(str, parityDropMatrix));
    let eff56bitKey: string = eff56bitKeyArr[0]; 
    const roudKeys: string[] = [];
    const oneBit: number[] = [0, 1, 8, 15];
    for(let i=0; i<16; i++){
        let leftPart = eff56bitKey.substring(0,  28);
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
        const RoundKey: string = permutate(eff56bitKey, keyCompressionPermutationMatrix)

        roudKeys.push(RoundKey);
    }
    return roudKeys
}

const keyCompressionPermutationMatrix: number[][] = [
    [14, 17, 11, 24, 1, 5, 3, 28],
    [15, 6, 21, 10, 23, 19, 12, 4],
    [26, 8, 16, 7, 27, 20, 13, 2],
    [41, 52, 31, 37, 47, 55, 30, 40],
    [51, 45, 33, 48, 44, 49, 39, 56],
    [34, 53, 46, 42, 50, 36, 29, 32]
];

const parityDropMatrix: number[][] = [
    [57, 49, 41, 33, 25, 17, 9, 1],
    [58, 50, 42, 34, 26, 18, 10, 2],
    [59, 51, 43, 35, 27, 19, 11, 3],
    [60, 52, 44, 36, 63, 55, 47, 39],
    [31, 23, 15, 7, 62, 54, 46, 38],
    [30, 22, 14, 6, 61, 53, 45, 37],
    [29, 21, 13, 5, 28, 20, 12, 4]
];

const initialPermutationMatrix: number[][] = [
    [58, 50, 42, 34, 26, 18, 10, 2],
    [60, 52, 44, 36, 28, 20, 12, 4],
    [62, 54, 46, 38, 30, 22, 14, 6],
    [64, 56, 48, 40, 32, 24, 16, 8],
    [57, 49, 41, 33, 25, 17, 9, 1],
    [59, 51, 43, 35, 27, 19, 11, 3],
    [61, 53, 45, 37, 29, 21, 13, 5],
    [63, 55, 47, 39, 31, 23, 15, 7]
];

const finalPermutationMatrix: number[][] = [
    [40, 8, 48, 16, 56, 24, 64, 32],
    [39, 7, 47, 15, 55, 23, 63, 31],
    [38, 6, 46, 14, 54, 22, 62, 30],
    [37, 5, 45, 13, 53, 21, 61, 29],
    [36, 4, 44, 12, 52, 20, 60, 28],
    [35, 3, 43, 11, 51, 19, 59, 27],
    [34, 2, 42, 10, 50, 18, 58, 26],
    [33, 1, 41, 9, 49, 17, 57, 25]
];