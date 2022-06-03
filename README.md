# Barcodery
Barcodery is a JavaScript library for generating barcodes.
## Install
```
$ npm install barcodery
```
## Usage
```Javascript
//import qrcode module
import QR from 'barcodery/qrcode';

const qrcode = new QR('#canvas-id',{
    text: "Some text",
    level:2
});
qrcode.draw({
    borderType:"circle",
    color: "red",
    width:500
});
```
## Other
Barcodery has its [windows desktop app](https://github.com/Preobars77/QRCodeGenerator) based on C#.
