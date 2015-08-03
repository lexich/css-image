"use strict";
var nodecss = require("node-css"),
    _ = require("lodash"),
    libpath = require("path"),
    CSS = nodecss.CSS;

var rxReplacePath = /(\/|\\)/g;
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
  var squeeze = !!options.squeeze ? +options.squeeze : 1;
  var _width = Math.floor(width/squeeze);
  var _height = Math.floor(height/squeeze);
  return css.statement(classname,{
    width: _width + "px",
    height: _height + "px",
    "background-image": this.url(filepath, root, options.retina),
    "background-size": "" + _width  + "px " + _height + "px"
  }, options);
};

CSSImage.prototype.scss_vars = function(filepath, _width, _height, options){
  var name = this.name(filepath, options);
  var squeeze = (options && !!options.squeeze) ? +options.squeeze : 1;
  var width = Math.floor(_width/squeeze);
  var height = Math.floor(_height/squeeze);
  var root = (options && options.root) || "";
  var retina = options && !!options.retina;

  return "$" + name + "__width: " + width + "px;\n" +
         "$" + name + "__height: " + height + "px;\n" +
         "$" + name + "__path: " + this.normalize_path(filepath, root, retina) + ";\n";
};

CSSImage.prototype.scss_mixin = function(filepath, _width, _height, root, options){
  var name = this.name(filepath, options);
  if(!options){ options = {}; }
  var classname = "@mixin " + name + "()";
  var is_retina = !!options.retina;
  var indent = css.options(options, "indent");
  var squeeze = (options && !!options.squeeze) ? +options.squeeze : 1;
  var width = Math.floor(_width/squeeze);
  var height = Math.floor(_height/squeeze);

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
  var normalized_path = libpath.join(this.normalize_folder(filepath, root), name);
  normalized_path = normalized_path.replace(rxReplacePath, '/');
  return normalized_path;
};

CSSImage.prototype.normalize_folder = function(filepath, root){
  var folder = libpath.dirname(filepath);
  if(folder[0] === "." && folder[1] !== "."){ folder = folder.slice(1); }
  if(folder[0] === "/"){ folder = folder.slice(1); }
  var result = root ? libpath.join(root, folder) : folder;
  return result.replace(rxReplacePath, "/");
};

CSSImage.prototype.name = function(filepath, options){
  var postfix = options && options.postfix ? options.postfix : "";
  if(options && options.squeeze){ postfix += "-s" + options.squeeze; }
  var prefix = options && (typeof options.prefix !== "undefined") ? options.prefix : "img_";
  var separator = (options && options.separator) || "_";
  var filename = libpath.basename(filepath);
  var ext = libpath.extname(filepath);
  var name = filename.slice(0, filename.length - ext.length).replace(/\./,"");
  var folder = this.normalize_folder(filepath);
  if(folder === ""){ return prefix + name + postfix; }
  // windows fix
  folder = folder.replace(rxReplacePath, separator);
  return prefix + folder + separator + name + postfix;
};

var _cssImage = new CSSImage();
function cssimage(images, _options){
  var options = _.omit(_options, ["retina","squeeze"]);
  var is_css = !!options.css;
  var is_scss = !!options.scss;
  var root = options.root || "";
  var result = "";
  var is_retina = _options && !!_options.retina;
  var squeeze = (_options && _options.squeeze) || 1;
  for(var i = 0; i< images.length; i++){
    var img = images[i];
    if(is_css){
      result += _cssImage.css(img.file, img.width, img.height, root, options);
      if(is_retina){
        result += _cssImage.css(img.file, img.width, img.height, root, _.extend({
          retina: true
        }, options));
      }
      if(squeeze !== 1){
        result += _cssImage.css(img.file, img.width, img.height, root, _.extend({
          squeeze: squeeze
        }, options));
      }
    }
    if(is_scss){
      result += _cssImage.scss(img.file, img.width, img.height, root, _.extend({
        retina: is_retina
      }, options));
      if(squeeze !== 1){
        result += _cssImage.scss(img.file, img.width, img.height, root, _.extend({
          squeeze: squeeze
        }, options));
      }
    }
  }
  return result;
}

module.exports = cssimage;
module.exports.CSSImage = CSSImage;
