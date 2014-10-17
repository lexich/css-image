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
  if(!options){ options = {}; }
  if(options.retina){
    options.media = MEDIA_QUERY;
  }
  return css.statement(classname,{
    width: width + "px",
    height: height + "px",
    "background-image": this.url(filepath, root, options.retina),
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
  var is_retina = !!options.retina;
  var indent = css.options(options, "indent");
  var scss_mixin = css.body({
    width: width + "px",
    height: height + "px",
    "background-image": this.url(filepath, root),
    "background-size": "" + width  + "px " + height + "px"
  }, {indent: indent});

  if(is_retina){
    var body = css.body({
      width: width + "px",
      height: height + "px",
      "background-image": this.url(filepath, root, options.retina),
      "background-size": "" + width  + "px " + height + "px"
    }, {indent: indent + indent});
    scss_mixin += indent + "@media " + MEDIA_QUERY + "{\n" + body + indent + "}\n";
  }
  return classname + "{\n" + scss_mixin + "}\n";
};

CSSImage.prototype.scss = function(filepath, width, height, root, options){
  return this.scss_mixin(filepath, width, height, root, options) +
         this.scss_vars(filepath, width, height, options);
};

CSSImage.prototype.url = function(filepath, root, retina){
  return "url(" + this.normalize_path(filepath, root, retina) + ")";
};

CSSImage.prototype.normalize_path = function(filepath, root, retina){
  var name = libpath.basename(filepath);
  var ext = libpath.extname(filepath);
  if(!!retina){
    var postfix = (typeof retina === "string") ? retina : "-50pc";
    name = name.replace(ext, postfix + ext);
  }
  return libpath.join(this.normalize_folder(filepath, root), name);
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
  var is_retina = !!options.retina;
  for(var i = 0; i< images.length; i++){
    var img = images[i];
    if(is_css){
      var opt = _.extend({}, options);
      delete opt.retina;
      result += _cssImage.css(img.file, img.width, img.height, root, opt);
      if(is_retina){
        opt = _.extend({retina: true}, options);
        result += _cssImage.css(img.file, img.width, img.height, root, opt);
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
