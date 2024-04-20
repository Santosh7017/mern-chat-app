import JSEncrypt from 'jsencrypt';

// Initialize
let encryptor = new JSEncrypt();

// Set the public key (this would be the recipient's public key in a real application)
encryptor.setPublicKey('-----BEGIN PUBLIC KEY----- MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFxBpo5/tkXC2D/FImH8rMEK65IzWu0n8cQffOfJN7s5IpC6+6Y/+J3/ONZfpRR/vt+1IaXVlOodWG1cNcQgeLZtsEj+WGBUEf9TufvM9gRqW5Bijm4cz1ZvSDtxzbQjzAYSedy5QiI79RUWljohX+wTMDF8gucJb7A431WZcU2wIDAQAB -----END PUBLIC KEY-----');

// Encrypt the message
let encryptedMessage = encryptor.encrypt('Hello, world!');

// Now, encryptedMessage contains the encrypted message

// To decrypt the message, you would use the recipient's private key:

// Initialize
let decryptor = new JSEncrypt();

// Set the private key
decryptor.setPrivateKey('-----BEGIN RSA PRIVATE KEY----- MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIXEGmjn+2RcLYP8UiYfyswQrrkjNa7SfxxB9858k3uzkikLr7pj/4nf841l+lFH++37UhpdWU6h1YbVw1xCB4tm2wSP5YYFQR/1O5+8z2BGpbkGKObhzPVm9IO3HNtCPMBhJ53LlCIjv1FRaWOiFf7BMwMXyC5wlvsDjfVZlxTbAgMBAAECgYA8y6YdK+JL+MEPDazgeu6W1LY0mtYZQL5Yv3q7NE9rl2/Ei/UwR6aqqUhuaXzdWFQeE217YhXm8RK1F46U7cWzY4gXH0ogXZxroMJd5qQ7+fHywOmEb0RiAAYdmiDXPoOmoS8IeNEwowHSuRA4tCSAe+SbygZ41CVYzr3RFQIZsQJBAMGXcWqnUCnQIxLfMkCSNJ0saEcGDooznFWhErZfkFTH+XUwDIF1LtbBdu0GfgScpZctnarsIkiqUS1Xa+pUpb8CQQCw4230BPSx41rL3D3T9GcrdbvqFv122/rZh04A34WeCLK7/qKigteOOJLyI2Jwyei5xALJpSM3+k2zkj5CP2/lAkEAvRxHerw+ntnnqUPHPzSTmQYMR3UvNun7ydozAVyRDYDbuxJY5Q2n17ndhuVUrQSo7eltn85UH0/hRL2leZ9+2QJBAKD3dTlXwSyXzioxU3orsC7WRphxL1oYOJ/3Br64qSj0lWGKCImGM43SYbZDCPPGaSeS/U5uHix0dHzymgFDJRkCQB4TDQtI7fIPcYvUt2QyWMBzBhiGf2iym0u9kcNZvdphObtgC0btxpLTVm7GXLsrXFXPa1bPpfUe5wyYDlyMykM= -----END RSA PRIVATE KEY-----');

// Decrypt the message
let decryptedMessage = decryptor.decrypt(encryptedMessage);

// Now, decryptedMessage contains the decrypted message
