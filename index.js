"use strict";
/* eslint object-shorthand: 0 */
var nodecss = require("node-css"),
  omit = require("lodash/omit"),
  extend = require("lodash/extend"),
  libpath = require("path");

var CSS = nodecss.CSS;
var rxReplacePath = /(\/|\\)/g;
var rxCleanSpace = /[ ]/g;
var MEDIA_QUERY = "(min-device-pixel-ratio: 2) and (min-resolution: 192dpi)";
var css = new CSS();

function CSSImage() {
}

CSSImage.prototype.css = function (filepath, width, height, root, options) {
  var classname = "." + this.name(filepath, options);
  if (!options) { options = {}; }
  if (options.retina) {
    options.media = MEDIA_QUERY;
  }
  var squeeze = !!options.squeeze ? +options.squeeze : 1;
  var _width = Math.floor(width / squeeze);
  var _height = Math.floor(height / squeeze);
  return css.statement(classname, {
    width: _width + "px",
    height: _height + "px",
    "background-image": this.url(filepath, root, options.retina),
    "background-size": "" + _width  + "px " + _height + "px"
  }, options);
};

CSSImage.prototype.scssVars = function (filepath, _width, _height, options) {
  var name = this.name(filepath, options);
  var squeeze = (options && !!options.squeeze) ? +options.squeeze : 1;
  var width = Math.floor(_width / squeeze);
  var height = Math.floor(_height / squeeze);
  var root = (options && options.root) || "";
  var retina = options && (("retina" in options) && (typeof options.retina === "string") ?
    options.retina : !!options.retina);

  return "$" + name + "__width: " + width + "px;\n" +
         "$" + name + "__height: " + height + "px;\n" +
         "$" + name + "__path: '" + this.normalizePath(filepath, root, retina) + "';\n";
};

CSSImage.prototype.scssMixin = function (filepath, _width, _height, root, options) {
  var name = this.name(filepath, options);
  if (!options) { options = {}; }
  var classname = "@mixin " + name + "()";
  var isRetina = !!options.retina;
  var indent = css.options(options, "indent");
  var squeeze = (options && !!options.squeeze) ? +options.squeeze : 1;
  var width = Math.floor(_width / squeeze);
  var height = Math.floor(_height / squeeze);

  var scssMixin = css.body({
    width: width + "px",
    height: height + "px",
    "background-image": this.url(filepath, root),
    "background-size": "" + width  + "px " + height + "px"
  }, { indent: indent });

  if (isRetina) {
    var body = css.body({
      width: width + "px",
      height: height + "px",
      "background-image": this.url(filepath, root, options.retina),
      "background-size": "" + width  + "px " + height + "px"
    }, { indent: indent + indent });
    scssMixin += indent + "@media " + MEDIA_QUERY + " {\n" + body + indent + "}\n";
  }
  return classname + " {\n" + scssMixin + "}\n";
};

CSSImage.prototype.scss = function (filepath, width, height, root, options) {
  return this.scssMixin(filepath, width, height, root, options) +
         this.scssVars(filepath, width, height, options);
};

CSSImage.prototype.url = function (filepath, root, retina) {
  return "url(" + this.normalizePath(filepath, root, retina) + ")";
};

CSSImage.prototype.normalizePath = function (filepath, root, retina) {
  var name = libpath.basename(filepath);
  var ext = libpath.extname(filepath);
  if (!!retina) {
    var postfix = (typeof retina === "string") ? retina : "-50pc";
    name = name.replace(ext, postfix + ext);
  }
  var normalizedPath = libpath.join(this.normalizeFolder(filepath, root), name);
  normalizedPath = normalizedPath.replace(rxReplacePath, "/");
  return normalizedPath;
};

CSSImage.prototype.normalizeFolder = function (filepath, root) {
  var folder = libpath.dirname(filepath);
  if (folder[0] === "." && folder[1] !== ".") { folder = folder.slice(1); }
  if (folder[0] === "/") { folder = folder.slice(1); }
  var result = root ? libpath.join(root, folder) : folder;
  return result.replace(rxReplacePath, "/").replace(rxCleanSpace, "");
};

CSSImage.prototype.name = function (filepath, options) {
  var postfix = options && options.postfix ? options.postfix : "";
  if (options && options.squeeze) { postfix += "-s" + options.squeeze; }
  var prefix = options && (typeof options.prefix !== "undefined") ? options.prefix : "img_";
  var separator = (options && options.separator) || "_";
  var filename = libpath.basename(filepath);
  var ext = libpath.extname(filepath);
  var name = filename.slice(0, filename.length - ext.length)
    .replace(/\./, "").replace(rxCleanSpace, "");
  var folder = this.normalizeFolder(filepath);
  if (folder === "") { return prefix + name + postfix; }

  // windows fix
  folder = folder.replace(rxReplacePath, separator);
  return prefix + folder + separator + name + postfix;
};

var _cssImage = new CSSImage();
function cssimage(images, _options) {
  var options = omit(_options, ["retina", "squeeze"]);
  var isCss = !!options.css;
  var isScss = !!options.scss;
  var root = options.root || "";
  var result = "";
  var isRetina = _options && !!_options.retina;
  var squeeze = (_options && _options.squeeze) || 1;
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    if (isCss) {
      result += _cssImage.css(img.file, img.width, img.height, root, options);
      if (isRetina) {
        result += _cssImage.css(img.file, img.width, img.height, root, extend({
          retina: _options.retina
        }, options));
      }
      if (squeeze !== 1) {
        result += _cssImage.css(img.file, img.width, img.height, root, extend({
          squeeze: squeeze
        }, options));
      }
    }
    if (isScss) {
      result += _cssImage.scss(img.file, img.width, img.height, root, extend({
        retina: _options.retina
      }, options));
      if (squeeze !== 1) {
        result += _cssImage.scss(img.file, img.width, img.height, root, extend({
          squeeze: squeeze
        }, options));
      }
    }
  }
  return result;
}

module.exports = cssimage;
module.exports.CSSImage = CSSImage;
