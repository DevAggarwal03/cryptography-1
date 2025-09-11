import { sBox1, sBox2, sBox3, sBox4, sBox5, sBox6, sBox7, sBox8 } from "./matrix";


const sBoxMapping: number[][][] = [
    sBox1,
    sBox2,
    sBox3,
    sBox4,
    sBox5,
    sBox6,
    sBox7,
    sBox8
]



export const sBoxesFn = (txt: string): string => {

    if(txt.length != 48){
        console.log("length of string not 48 bits");
        return "";
    }

    let ans = "";

    for(let i=0; i<8; i++){
        const bit6Str = txt.substring(i*6, i*6 + 6);
        const rowBin = bit6Str[0] + bit6Str[5];
        const colBin = bit6Str.substring(1, 5);
        // console.log(i, ' ', sBoxMapping[i][parseInt(rowBin, 2)][parseInt(colBin, 2)])
        ans += (sBoxMapping[i][parseInt(rowBin, 2)][parseInt(colBin, 2)]).toString(2).padStart(4, '0'); 
    }

    return ans 
}