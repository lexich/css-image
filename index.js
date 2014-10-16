"use strict";
//{ format: 'png', width: 400, height: 300, file: '2.png' }
var nodecss = require("node-css"),
    _ = require("lodash"),
    libpath = require("path"),
    CSS = nodecss.CSS;

var MEDIA_QUERY = "(min-device-pixel-ratio: 2) and (min-resolution: 192dpi)";
var css = new CSS();

function CSSImage(){
}

CSSImage.prototype.css = function(filepath, width, height, root, options){
  var classname = "." + this.name(filepath, options);
  if(options && options.is_retina){
    options.media = MEDIA_QUERY;
  }
  return css.statement(classname,{
    width: width + "px",
    height: height + "px",
    "background-image": this.url(filepath, root),
    "background-size": "" + width  + "px " + height + "px"
  }, options);
};

CSSImage.prototype.scss_vars = function(filepath, width, height, options){
  var name = this.name(filepath, options);
  return "$" + name + "__width: " + width + "px;\n" +
         "$" + name + "__height: " + height + "px;\n";
};

CSSImage.prototype.scss_mixin = function(filepath, width, height, root, options){
  var name = this.name(filepath, options);
  if(!options){ options = {}; }
  var classname = "@mixin " + name + "()";
  var is_retina = !!options.is_retina;
  var indent = css.options(options, "indent");
  var scss_mixin = css.body({
    width: width + "px",
    height: height + "px",
    "background-image": this.url(filepath, root),
    "background-size": "" + width  + "px " + height + "px"
  }, {indent: indent});

  if(is_retina){
    var _width = Math.floor(width / 2);
    var _height = Math.floor(height / 2);
    var body = css.body({
      width: _width + "px",
      height: _height + "px",
      "background-image": this.url(filepath, root),
      "background-size": "" + _width  + "px " + _height + "px"
    }, {indent: indent + indent});
    scss_mixin += indent + "@media " + MEDIA_QUERY + "{\n" + body + indent + "}\n";
  }
  return classname + "{\n" + scss_mixin + "}\n";
};

CSSImage.prototype.scss = function(filepath, width, height, root, options){
  return this.scss_mixin(filepath, width, height, root, options) +
         this.scss_vars(filepath, width, height, options);
};

CSSImage.prototype.url = function(filepath, root){
  return "url(" + this.normalize_path(filepath, root) + ")";
};

CSSImage.prototype.normalize_path = function(filepath, root){
  return libpath.join(
    this.normalize_folder(filepath, root),
    libpath.basename(filepath)
  );
};

CSSImage.prototype.normalize_folder = function(filepath, root){
  var folder = libpath.dirname(filepath);
  if(folder[0] === "." && folder[1] !== "."){ folder = folder.slice(1); }
  if(folder[0] === "/"){ folder = folder.slice(1); }
  if(root){
    return libpath.join(root, folder);
  } else {
    return folder;
  }
};

CSSImage.prototype.name = function(filepath, options){
  var postfix = options && options.postfix ? options.postfix : "";
  var prefix = options && options.prefix ? options.prefix : "img_";
  var filename = libpath.basename(filepath);
  var ext = libpath.extname(filepath);
  var name = filename.slice(0, filename.length - ext.length).replace(/\./,"");
  var folder = this.normalize_folder(filepath);
  if(folder === ""){ return prefix + name + postfix; }
  return prefix + folder.replace(/\//g, "_") + "_" + name + postfix;
};

var _cssImage = new CSSImage();
function cssimage(images, options){
  options = _.extend({}, options);
  var is_css = !!options.css;
  var is_scss = !!options.scss;
  var root = options.root || "";
  var result = "";
  var is_retina = !!options.is_retina;
  if(is_retina){ delete options.is_retina; }
  for(var i = 0; i< images.length; i++){
    var img = images[i];
    if(is_css){
      result += _cssImage.css(img.file, img.width, img.height, root, options);
      if(is_retina){
        var opt = _.extend({is_retina: true}, options);
        result += _cssImage.css(img.file, img.width/2, img.height/2, root, opt);
      }
    }
    if(is_scss){
      var opt2 = _.extend({is_retina: true}, options);
      result += _cssImage.scss(img.file, img.width, img.height, root, opt2);
    }
  }
  return result;
}

module.exports = cssimage;
module.exports.CSSImage = CSSImage;
