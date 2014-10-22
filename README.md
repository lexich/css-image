generator css and scss templates for images

[![Build Status](https://travis-ci.org/lexich/css-image.svg)](https://travis-ci.org/lexich/css-image)
[![NPM version](https://badge.fury.io/js/css-image.svg)](http://badge.fury.io/js/css-image)
[![Coverage Status](https://coveralls.io/repos/lexich/css-image/badge.png?branch=master)](https://coveralls.io/r/lexich/css-image?branch=master)

### Examples
```javascript
var imagecss = require("css-image");
var files = [{
  width: 400,
  height: 300,
  file: "t.png"
}];
var result = imagecss(files ,{
  css: true,
  scss: true,
  retina: true,
  squeeze: 2,
  root: "root"
})
```

result is
```scss
.img_t{ 
  width: 400px;
  height: 300px; 
  background-image: url(root/t.png); 
  background-size: 400px 300px; 
} 
@media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){ 
  .img_t{ 
    width: 400px; 
    height: 300px; 
    background-image: url(root/t-50pc.png); 
    background-size: 400px 300px; 
  } 
} 
.img_t-s2{ 
  width: 200px; 
  height: 150px; 
  background-image: url(root/t.png); 
  background-size: 200px 150px; 
} 
@mixin img_t(){ 
  width: 400px; 
  height: 300px; 
  background-image: url(root/t.png); 
  background-size: 400px 300px; 
  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){ 
    width: 400px; 
    height: 300px; 
    background-image: url(root/t-50pc.png); 
    background-size: 400px 300px; 
  } 
} 
$img_t__width: 400px; 
$img_t__height: 300px; 
@mixin img_t-s2(){ 
  width: 200px; 
  height: 150px; 
  background-image: url(root/t.png); 
  background-size: 200px 150px; 
} 
$img_t-s2__width: 200px; 
$img_t-s2__height: 150px;
```

### Options
- **root**: path to folder where images locate
> *type*: String  
> *default*: ""  
> *example*: 
  ```
    file: `test/image.png`  
    root: `images`  
    result: `images/test/image.png`
  ```

- **css**: generate css
> *type*: Boolean 
> *default*: false  
> *example*:
  ```css
  .img_t{ 
    width: 400px;
    height: 300px; 
    background-image: url(root/t.png); 
    background-size: 400px 300px; 
  } 
  ```

- **scss**: generate scss
> *type*: Boolean  
> *default*: false  
> *example*:
  ```scss
  @mixin img_t(){ 
    width: 400px; 
    height: 300px; 
    background-image: url(root/t.png); 
    background-size: 400px 300px; 
  }
  ```

- **retina**: generate media-query for retina images, file must locates in the same folder with the same name with retina postfix  
> *type*: Boolean|String  
> *default*: false  
> *example*:  
  for css
  ```css
  .img_t{ 
    width: 400px;
    height: 300px; 
    background-image: url(root/t.png); 
    background-size: 400px 300px; 
  } 
  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){ 
    .img_t{ 
      width: 400px; 
      height: 300px; 
      background-image: url(root/t-50pc.png); 
      background-size: 400px 300px; 
    } 
  } 
  ```
  for scss
  ```scss
    @mixin img_t(){ 
    width: 400px; 
    height: 300px; 
    background-image: url(root/t.png); 
    background-size: 400px 300px; 
    @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){ 
      width: 400px; 
      height: 300px; 
      background-image: url(root/t-50pc.png); 
      background-size: 400px 300px; 
    } 
  } 
  $img_t__width: 400px; 
  $img_t__height: 300px; 
  ```

- **squeeze**: squeeze image in `squeeze` times  
> *type*: Int  
> *default*: 1  
> *example*: squeeze=2  
  for css
  ```css
  .img_t{ 
    width: 400px;
    height: 300px; 
    background-image: url(root/t.png); 
    background-size: 400px 300px; 
  } 
  .img_t-s2{ 
    width: 200px; 
    height: 150px; 
    background-image: url(root/t.png); 
    background-size: 200px 150px; 
  } 
  ```
  for scss
  ```scss
  @mixin img_t(){ 
    width: 400px; 
    height: 300px; 
    background-image: url(root/t.png); 
    background-size: 400px 300px; 
  } 
  $img_t__width: 400px; 
  $img_t__height: 300px; 
  @mixin img_t-s2(){ 
    width: 200px; 
    height: 150px; 
    background-image: url(root/t.png); 
    background-size: 200px 150px; 
  } 
  $img_t-s2__width: 200px; 
  $img_t-s2__height: 150px;
  ```
  
- **separator**: separator for generating names
> *type*: string  
> *default*: "_"  

- **prefix**: prefix for generating names
> *type*: string  
> *default*: "img_"  

### ChangeLog
- 0.1.0 rename css-image
- 0.0.2 add separator option
- 0.0.1 Basic functionality

