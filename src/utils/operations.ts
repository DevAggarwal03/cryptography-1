export const xorFn = (a: string, b: string): string => {
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


export const leftShift = (str: string, num: number) => {
    return str.substring(num) + str.substring(0, num);
}