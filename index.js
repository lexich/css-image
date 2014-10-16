"use strict";
//{ format: 'png', width: 400, height: 300, file: '2.png' }
var nodecss = require("node-css"),
    libpath = require("path"),
    CSS = nodecss.CSS;

var MEDIA_QUERY = "(min-device-pixel-ratio: 2) and (min-resolution: 192dpi)";
var css = new CSS();
function CSSImage(){

}

CSSImage.prototype.css = function(filepath, width, height, root, options){
  var classname = "." + this.name(filepath);
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

CSSImage.prototype.scss_vars = function(filepath, width, height){
  var name = this.name(filepath);
  return "$" + name + "__width: " + width + "px\n" +
         "$" + name + "__height: " + height + "px\n";
};

CSSImage.prototype.scss_mixin = function(filepath, width, height, root, options){
  var name = this.name(filepath);
  var classname = "@mixin " + name + "()";
  var is_retina = options && options.is_retina;
  var indent = "";
  if(is_retina){
    indent = css.options(options, "indent");
    options.indent = indent + indent;
  }
  var body = css.body({
    width: width + "px",
    height: height + "px",
    "background-image": this.url(filepath, root),
    "background-size": "" + width  + "px " + height + "px"
  }, options);
  if(is_retina){
    body = indent + "@media " + MEDIA_QUERY + "{\n" + body + indent + "}\n";
  }
  return classname + "{\n" + body + "}\n";
};

CSSImage.prototype.scss = function(filepath, width, height, root, options){
  return this.scss_mixin(filepath, width, height, root, options) +
         this.scss_vars(filepath, width, height);
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

CSSImage.prototype.name = function(filepath){
  var filename = libpath.basename(filepath);
  var ext = libpath.extname(filepath);
  var name = filename.slice(0, filename.length - ext.length).replace(/\./,"");
  var folder = this.normalize_folder(filepath);
  if(folder === ""){ return name; }
  return folder.replace(/\//g, "_") + "_" + name;
};


function cssimage(){

}

module.exports = cssimage;
module.exports.CSSImage = CSSImage;
