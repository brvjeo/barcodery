# Barcodery
Barcodery is a JavaScript library for generating barcodes.
## Install
```
$ npm install barcodery
```
## Usage
### QR Code
``` Javascript
import QR from 'barcodery/qrcode';

const qrcode = new QR('#canvas-id',{
    level:2
});

qrcode.generate("Some text.");

```
## Options
### text
Sets encoded text.
### color
Sets barcode color. By default `"black"`.
### borderType
Sets type of pixel corners. If `"circle"`, all code modules will be rounded. By default `"square"`.
### level
Sets correction level. Only `2` level is available now.


## Other
Barcodery has its [windows desktop app](https://github.com/Preobars77/QRCodeGenerator) based on C#.
