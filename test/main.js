/* global describe, it, xit */
/* jshint expr: true */
"use strict";

var cssimage = require("../");
require("chai").should();

describe("test CSSImage", function() {
  var CSSImage = cssimage.CSSImage;
  var c = new CSSImage();
  it("test name", function() {
    c.name("2.png").should.eql("img_2");
    c.name("test/2.jpg").should.eql("img_test_2");
    c.name("/images/test/2.gif").should.eql("img_images_test_2");
    c.name("./images/test/2.gif").should.eql("img_images_test_2");
    c.name(".images/test/2.gif").should.eql("img_images_test_2");
    c.name("images/test/.2.jpg").should.eql("img_images_test_2");
    c.name("2.png", {postfix: "-2x"}).should.eql("img_2-2x");
    c.name("images/test/2.png", {separator: "@"}).should.eql("img_images@test@2");
    c.name("images/test/2.png", {prefix: "test_"}).should.eql("test_images_test_2");
  });
  it("test normalizeFolder", function() {
    c.normalizeFolder(".").should.eql("");
    c.normalizeFolder("test.jpg").should.eql("");
    c.normalizeFolder("/test.jpg").should.eql("");
    c.normalizeFolder("./test.jpg").should.eql("");
    c.normalizeFolder(".test.jpg").should.eql("");
    c.normalizeFolder("test/test1.jpg").should.eql("test");
    c.normalizeFolder("../images/test").should.eql("../images");
  });
  it("test normalizeFolder with root", function() {
    c.normalizeFolder(".", "images").should.eql("images");
    c.normalizeFolder("test/test.jpg", "images").should.eql("images/test");
    c.normalizeFolder("/test.jpg", "images/root").should.eql("images/root");
    c.normalizeFolder("./test.jpg", "images").should.eql("images");
    c.normalizeFolder(".test.jpg", "root").should.eql("root");
    c.normalizeFolder("../images/test.jpg", "root").should.eql("images");
    c.normalizeFolder("images/test.jpg", "../root").should.eql("../root/images");
  });
  it("test normalizePath", function() {
    c.normalizePath(".").should.eql(".");
    c.normalizePath("test.jpg").should.eql("test.jpg");
    c.normalizePath("/test.jpg").should.eql("test.jpg");
    c.normalizePath("./test.jpg").should.eql("test.jpg");
    c.normalizePath(".test.jpg").should.eql(".test.jpg");
    c.normalizePath("test/test1.jpg").should.eql("test/test1.jpg");
    c.normalizePath("test.jpg", "root", true).should.eql("root/test-50pc.jpg");
    c.normalizePath("test.jpg", "root", "-2x").should.eql("root/test-2x.jpg");
  });
  it("test normalizePath with root", function() {
    c.normalizePath(".", "images").should.eql("images");
    c.normalizePath("test/test.jpg", "images").should.eql("images/test/test.jpg");
    c.normalizePath("/test.jpg", "images/root").should.eql("images/root/test.jpg");
    c.normalizePath("./test.jpg", "images").should.eql("images/test.jpg");
    c.normalizePath(".test.jpg", "root").should.eql("root/.test.jpg");
  });
  it("test url", function() {
    c.url("test.jpg", "../images").should.eql("url(../images/test.jpg)");
    c.url("test.jpg", "../images", true).should.eql("url(../images/test-50pc.jpg)");
    c.url("test.jpg", "../images", "-2x").should.eql("url(../images/test-2x.jpg)");
  });
  it("test css", function() {
    var result = ".img_test_images {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.css("test/images.jpg", 100, 110, "../images").should.eql(result);
    result = ".img_test_images-2x {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.css("test/images.jpg", 100, 110, "../images", { postfix: "-2x"}).should.eql(result);
  });
  it("test css with separator", function() {
    var result = ".img-test-images {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.css("test/images.jpg", 100, 110, "../images", {separator: "-", prefix: "img-"}).should.eql(result);
  });
  it("test css with empty prefix", function() {
    var result = ".test_images {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.css("test/images.jpg", 100, 110, "../images", {prefix: ""}).should.eql(result);
  });
  it("test css with retina", function() {
    var result = "@media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
                 "  .img_test_images {\n" +
                 "    width: 100px;\n" +
                 "    height: 110px;\n" +
                 "    background-image: url(../images/test/images-50pc.jpg);\n" +
                 "    background-size: 100px 110px;\n" +
                 "  }\n" +
                 "}\n";
    c.css("test/images.jpg", 100, 110, "../images", {retina: true}).should.eql(result);
  });
  it("test css with squeeze", function() {
    var result = ".img_test_t-s2 {\n" +
                 "  width: 50px;\n" +
                 "  height: 55px;\n" +
                 "  background-image: url(root/test/t.jpg);\n" +
                 "  background-size: 50px 55px;\n" +
                 "}\n";
    c.css("test/t.jpg", 100, 110, "root", {squeeze: 2}).should.eql(result);
  });
  it("test scssMixin with retina", function() {
    var result = "@mixin img_test_images() {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
                 "    width: 100px;\n" +
                 "    height: 110px;\n" +
                 "    background-image: url(../images/test/images-50pc.jpg);\n" +
                 "    background-size: 100px 110px;\n" +
                 "  }\n" +
                 "}\n";
    c.scssMixin("test/images.jpg", 100, 110, "../images", {retina: true}).should.eql(result);
  });
  it("test scssMixin", function() {
    var result = "@mixin img_test_images() {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.scssMixin("test/images.jpg", 100, 110, "../images").should.eql(result);
  });
  it("test scssMixin with squeeze", function() {
    var result = "@mixin img_test_images-s2() {\n" +
                 "  width: 50px;\n" +
                 "  height: 55px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 50px 55px;\n" +
                 "}\n";
    c.scssMixin("test/images.jpg", 100, 110, "../images", {squeeze: 2}).should.eql(result);
  });
  it("test scssMixin with empty prefix", function() {
    var result = "@mixin test_images() {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.scssMixin("test/images.jpg", 100, 110, "../images", {prefix: ""}).should.eql(result);
  });

  it("test scssVars", function() {
    var result = "$img_test_images__width: 100px;\n" +
                 "$img_test_images__height: 110px;\n" +
                 "$img_test_images__path: 'test/images.jpg';\n";
    c.scssVars("test/images.jpg", 100, 110).should.eql(result);
    result = "$img_test_images-2x__width: 100px;\n" +
             "$img_test_images-2x__height: 110px;\n" +
             "$img_test_images-2x__path: 'test/images.jpg';\n";
    c.scssVars("test/images.jpg", 100, 110, { postfix: "-2x"}).should.eql(result);
    result = "$img_test_images-s2__width: 50px;\n" +
             "$img_test_images-s2__height: 55px;\n" +
             "$img_test_images-s2__path: 'test/images.jpg';\n";
    c.scssVars("test/images.jpg", 100, 110, {squeeze: 2}).should.eql(result);
    result = "$test_images__width: 100px;\n" +
             "$test_images__height: 110px;\n" +
             "$test_images__path: 'test/images.jpg';\n";
    c.scssVars("test/images.jpg", 100, 110, {prefix: ""}).should.eql(result);
  });
  it("test scss", function() {
    var result = "@mixin img_test_images() {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n" +
                "$img_test_images__width: 100px;\n" +
                "$img_test_images__height: 110px;\n" +
                "$img_test_images__path: 'test/images.jpg';\n";
    c.scss("test/images.jpg", 100, 110, "../images").should.eql(result);
    result = "@mixin img_test_images-2x() {\n" +
             "  width: 100px;\n" +
             "  height: 110px;\n" +
             "  background-image: url(../images/test/images.jpg);\n" +
             "  background-size: 100px 110px;\n" +
             "}\n" +
            "$img_test_images-2x__width: 100px;\n" +
            "$img_test_images-2x__height: 110px;\n" +
            "$img_test_images-2x__path: 'test/images.jpg';\n";
    c.scss("test/images.jpg", 100, 110, "../images", { postfix: "-2x"}).should.eql(result);
  });
  it("test scss with retina", function() {
    var result = "@mixin img_test_images() {\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
                 "    width: 100px;\n" +
                 "    height: 110px;\n" +
                 "    background-image: url(../images/test/images-50pc.jpg);\n" +
                 "    background-size: 100px 110px;\n" +
                 "  }\n" +
                 "}\n" +
                "$img_test_images__width: 100px;\n" +
                "$img_test_images__height: 110px;\n" +
                "$img_test_images__path: 'test/images-50pc.jpg';\n";
    c.scss("test/images.jpg", 100, 110, "../images", {retina: true}).should.eql(result);
  });
  it("test external api all args", function() {
    var result = "" +
      ".img_t {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "}\n" +
      "@media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
      "  .img_t {\n" +
      "    width: 400px;\n" +
      "    height: 300px;\n" +
      "    background-image: url(root/t-50pc.png);\n" +
      "    background-size: 400px 300px;\n" +
      "  }\n" +
      "}\n" +
      ".img_t-s2 {\n" +
      "  width: 200px;\n" +
      "  height: 150px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 200px 150px;\n" +
      "}\n" +
      "@mixin img_t() {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
      "    width: 400px;\n" +
      "    height: 300px;\n" +
      "    background-image: url(root/t-50pc.png);\n" +
      "    background-size: 400px 300px;\n" +
      "  }\n" +
      "}\n" +
      "$img_t__width: 400px;\n" +
      "$img_t__height: 300px;\n" +
      "$img_t__path: 'root/t-50pc.png';\n" +
      "@mixin img_t-s2() {\n" +
      "  width: 200px;\n" +
      "  height: 150px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 200px 150px;\n" +
      "}\n" +
      "$img_t-s2__width: 200px;\n" +
      "$img_t-s2__height: 150px;\n" +
      "$img_t-s2__path: 'root/t.png';\n";

    cssimage([{ width: 400, height: 300, file: "t.png"}], {
      css: true,
      scss: true,
      retina: true,
      squeeze: 2,
      root: "root"
    }).should.eql(result);
  });
  it("test external api scss without retina with default", function() {
    var result = "" +
      "@mixin img_t() {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "}\n" +
      "$img_t__width: 400px;\n" +
      "$img_t__height: 300px;\n" +
      "$img_t__path: 'root/t.png';\n";

    cssimage([{ width: 400, height: 300, file: "t.png"}], {
      css: false,
      scss: true,
      retina: false,
      root: "root"
    }).should.eql(result);
  });
  it("test external api css all options", function() {
    var result = "" +
      ".img_t {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "}\n" +
      "@media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
      "  .img_t {\n" +
      "    width: 400px;\n" +
      "    height: 300px;\n" +
      "    background-image: url(root/t-50pc.png);\n" +
      "    background-size: 400px 300px;\n" +
      "  }\n" +
      "}\n" +
      ".img_t-s2 {\n" +
      "  width: 200px;\n" +
      "  height: 150px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 200px 150px;\n" +
      "}\n";
    cssimage([{ width: 400, height: 300, file: "t.png"}], {
      css: true,
      retina: true,
      squeeze: 2,
      root: "root"
    }).should.eql(result);
  });
  it("test external api css retina only", function() {
    var result = "" +
      ".img_t {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "}\n" +
      "@media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
      "  .img_t {\n" +
      "    width: 400px;\n" +
      "    height: 300px;\n" +
      "    background-image: url(root/t-50pc.png);\n" +
      "    background-size: 400px 300px;\n" +
      "  }\n" +
      "}\n";
    cssimage([{ width: 400, height: 300, file: "t.png"}], {
      css: true,
      retina: true,
      root: "root"
    }).should.eql(result);
  });
  it("test external api css squeeze only", function() {
    var result = "" +
      ".img_t {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "}\n" +
      ".img_t-s2 {\n" +
      "  width: 200px;\n" +
      "  height: 150px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 200px 150px;\n" +
      "}\n";
    cssimage([{ width: 400, height: 300, file: "t.png"}], {
      css: true,
      squeeze: 2,
      root: "root"
    }).should.eql(result);
  });
  it("test external api scss all options", function() {
    var result = "" +
      "@mixin img_t() {\n" +
      "  width: 400px;\n" +
      "  height: 300px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 400px 300px;\n" +
      "  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {\n" +
      "    width: 400px;\n" +
      "    height: 300px;\n" +
      "    background-image: url(root/t-50pc.png);\n" +
      "    background-size: 400px 300px;\n" +
      "  }\n" +
      "}\n" +
      "$img_t__width: 400px;\n" +
      "$img_t__height: 300px;\n" +
      "$img_t__path: 'root/t-50pc.png';\n" +
      "@mixin img_t-s2() {\n" +
      "  width: 200px;\n" +
      "  height: 150px;\n" +
      "  background-image: url(root/t.png);\n" +
      "  background-size: 200px 150px;\n" +
      "}\n" +
      "$img_t-s2__width: 200px;\n" +
      "$img_t-s2__height: 150px;\n" +
      "$img_t-s2__path: 'root/t.png';\n";

    cssimage([{ width: 400, height: 300, file: "t.png"}], {
      scss: true,
      retina: true,
      squeeze: 2,
      root: "root"
    }).should.eql(result);
  });
});
