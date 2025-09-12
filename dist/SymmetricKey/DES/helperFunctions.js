"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpadPKCS7 = exports.padPKCS7 = void 0;
// PKCS#7 padding for blockSize (8 for DES)
const padPKCS7 = (data, blockSize = 8) => {
    const padLen = blockSize - (data.length % blockSize) || blockSize; // if multiple, padLen = blockSize
    if (padLen > 8) {
        console.log("hit");
    }
    const out = new Uint8Array(data.length + padLen);
    out.set(data, 0);
    out.fill(padLen, data.length); // fill last padLen bytes with value padLen
    return out;
};
exports.padPKCS7 = padPKCS7;
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
exports.unpadPKCS7 = unpadPKCS7;
