import { DESDescryption, DESEncryption } from './SymmetricKey/DES/dataEcryptionStandard/DES';
import { DDESDescryption, DDESEncryption } from './SymmetricKey/DES/doubleDataEcyrptionStandard/DDES';

// const tempPara = "ASCII stands for American Standard Code for Information Interchange. Computers can only understand numbers, so an ASCII code is the numerical representation of a character such as 'a' or '@' or an action of some sort. ASCII was developed a long time ago and now the non-printing characters are rarely used for their original purpose. Below is the ASCII character table and this includes descriptions of the first 32 non-printing characters."
const tempPara = "ASCII stands for American Standard Code"

console.log("message: ", tempPara);
const cipher: string = DESEncryption(tempPara, "SECRET");
console.log("cipher hex: ", cipher);
const plainText: string = DESDescryption(cipher, "SECRET");
console.log("plain text: ", plainText)



console.log("message: ", tempPara);
const DDesCipher: string = DDESEncryption(tempPara, "SECRE1", "SECRE2");
console.log("cipher hex: ", DDesCipher);
const DDesPlainText: string = DDESDescryption(DDesCipher, "SECRE1", "SECRE2");
console.log("plain text: ", DDesPlainText)