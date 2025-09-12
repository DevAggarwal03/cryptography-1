import { sBoxesFn } from "../desSBoxes";
import { toBinary, hexTo64BitBinArray, binToTxt, binTo64BitBinArr, permutate, binary64ArrStrToHex, bin64bitArrToBinStr } from "../../../utils/conversions";
import { leftShift, xorFn } from "../../../utils/operations";
import { expansionPBoxFnMatrix, finalPermutationMatrix, initialPermutationMatrix, keyCompressionPermutationMatrix, parityDropMatrix, straightPBoxEncFnMatrix } from "../matrix";

// main des encryption function
export const DESEncryption = (plainTxt: string, key: string): string => {
    // xxxxxxxx xxxxxxxx ...
    const binaryPlainTxt = toBinary(plainTxt);
    const binaryKeyStr = toBinary(key);

    const arr64Plain : string[] = binTo64BitBinArr(binaryPlainTxt);
    const arr64Key : string[] = binTo64BitBinArr(binaryKeyStr);

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




// main des decryption function
export const DESDescryption = (cipherHex: string, key: string): string => {
    const binaryKeyStr = toBinary(key);
    const cipherTxt: string[] = hexTo64BitBinArray(cipherHex);
    const initialPermutationArr = cipherTxt.map((str:string) => permutate(str, initialPermutationMatrix));
    const arr64Key : string[] = binTo64BitBinArr(binaryKeyStr);
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

    const binaryPlainTxt = bin64bitArrToBinStr(arr64Plain);
    const plainTxt = binToTxt(binaryPlainTxt);

    return plainTxt; 
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
