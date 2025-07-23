const crypto = require('crypto');
require('dotenv').config();

const algorithm = process.env.ALGORITHM;
const key = Buffer.from(process.env.KEY, 'hex');

const encrypt = (data, iv) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data.toString(), "utf-8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

const decrypt = (data, ivBase64) => {
    const iv = Buffer.from(ivBase64, 'base64') //the iv base64
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(data, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    return decryptedData;
};


module.exports = { encrypt, decrypt };
