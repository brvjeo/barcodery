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
    color: '#020202'
})
```
## Other
Barcodery has its [windows desktop app] (https://github.com/Preobars77/QRCodeGenerator)based on C#.
