import { padPKCS7, unpadPKCS7 } from "../SymmetricKey/DES/helperFunctions";

export const toBinary = (plainTxt: string): string => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(plainTxt);
    const padded = padPKCS7(bytes, 8); 

    // convert to "01010101 00110011 ..." format
    return Array.from(padded).map(b => b.toString(2).padStart(8, '0')).join("");
}

export const hexTo64BitBinArray = (hex: string): string[] => {
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

export const binToTxt = (binStr: string): string => {
    if (!binStr || binStr.trim() === "") return "";
    const binaryBytes = binStr.trim().split(/\s+/);
    const bytes = Uint8Array.from(binaryBytes.map(b => parseInt(b, 2)));
    const unpadded = unpadPKCS7(bytes);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(unpadded);
}

export const binTo64BitBinArr = (binaryStr: string): string[] => {
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

export const bin64bitArrToBinStr = (binaryStrArr: string[]): string => {
    let ans: string[] = [];
    for(let i=0; i<binaryStrArr.length; i++){
        for(let j=0; j<8; j++){
            ans.push(binaryStrArr[i].substring(j*8, j*8 + 8));
        }
    }

    // xxxxxxxx xxxxxxxx ...
    return ans.join(" "); 
}

export const permutate = (str: string, permutationMatrx: number[][]): string => {
    let computedStr: string = "";
    try {
        for(let i=0; i<permutationMatrx.length; i++){
            for(let j=0; j<permutationMatrx[i].length; j++){
                if(permutationMatrx[i][j] - 1 >= str.length){
                    // console.log('index')
                    throw new Error("index error!") 
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

export const binary64ArrStrToHex = (strArr: string[]): string => {
    let temp = "";
    strArr.forEach((str: string) => {
        temp += binary64strToHex(str);
    })

    return temp;
}

export const binary64strToHex = (str: string): string => {
    if(str.length != 64){
        throw new Error(`string of length ${str.length} is not of correct length of 64`)
    }
    let ans: string = "";
    for(let i=0; i<64; i+=4){
        const tempStr = str.substring(i, i+4);
        const decimal = parseInt(tempStr, 2);
        ans += decimal.toString(16);
    }
    return ans;
}