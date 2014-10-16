/*global describe, it, xit*/
/* jshint expr: true */
"use strict";

var should = require("should"),
    cssimage = require("../");

describe("test CSSImage", function(){
  var CSSImage = cssimage.CSSImage;
  var c = new CSSImage();
  it("test name", function(){
    c.name("2.png").should.eql("img_2");
    c.name("test/2.jpg").should.eql("img_test_2");
    c.name("/images/test/2.gif").should.eql("img_images_test_2");
    c.name("./images/test/2.gif").should.eql("img_images_test_2");
    c.name(".images/test/2.gif").should.eql("img_images_test_2");
    c.name("images/test/.2.jpg").should.eql("img_images_test_2");
  });
  it("test normalize_folder", function(){
    c.normalize_folder(".").should.eql("");
    c.normalize_folder("test.jpg").should.eql("");
    c.normalize_folder("/test.jpg").should.eql("");
    c.normalize_folder("./test.jpg").should.eql("");
    c.normalize_folder(".test.jpg").should.eql("");
    c.normalize_folder("test/test1.jpg").should.eql("test");
    c.normalize_folder("../images/test").should.eql("../images");
  });
  it("test normalize_folder with root", function(){
    c.normalize_folder(".", "images").should.eql("images");
    c.normalize_folder("test/test.jpg", "images").should.eql("images/test");
    c.normalize_folder("/test.jpg", "images/root").should.eql("images/root");
    c.normalize_folder("./test.jpg", "images").should.eql("images");
    c.normalize_folder(".test.jpg", "root").should.eql("root");
    c.normalize_folder("../images/test.jpg", "root").should.eql("images");
    c.normalize_folder("images/test.jpg", "../root").should.eql("../root/images");
  });
  it("test normalize_path", function(){
    c.normalize_path(".").should.eql(".");
    c.normalize_path("test.jpg").should.eql("test.jpg");
    c.normalize_path("/test.jpg").should.eql("test.jpg");
    c.normalize_path("./test.jpg").should.eql("test.jpg");
    c.normalize_path(".test.jpg").should.eql(".test.jpg");
    c.normalize_path("test/test1.jpg").should.eql("test/test1.jpg");
  });
  it("test normalize_path with root", function(){
    c.normalize_path(".", "images").should.eql("images");
    c.normalize_path("test/test.jpg", "images").should.eql("images/test/test.jpg");
    c.normalize_path("/test.jpg", "images/root").should.eql("images/root/test.jpg");
    c.normalize_path("./test.jpg", "images").should.eql("images/test.jpg");
    c.normalize_path(".test.jpg", "root").should.eql("root/.test.jpg");
  });
  it("test url", function(){
    c.url("test.jpg", "../images").should.eql("url(../images/test.jpg)");
  });
  it("test css", function(){
    var result = ".img_test_images{\n" +
                 "  width: 100px;\n" +
                 "  height: 110px;\n" +
                 "  background-image: url(../images/test/images.jpg);\n" +
                 "  background-size: 100px 110px;\n" +
                 "}\n";
    c.css("test/images.jpg", 100, 110, "../images").should.eql(result);
  });
  it("test css with retina", function(){
    var result = "@media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){\n" + 
                 "  .img_test_images{\n" +
                 "    width: 50px;\n" +
                 "    height: 55px;\n" +
                 "    background-image: url(../images/test/images.jpg);\n" +
                 "    background-size: 50px 55px;\n" +
                 "  }\n" +
                 "}\n";
    c.css("test/images.jpg", 50, 55, "../images", {is_retina: true}).should.eql(result);
  });

  it("test scss_mixin with retina", function(){
    var result = "@mixin img_test_images(){\n" + 
                 "  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){\n" +
                 "    width: 100px;\n" +
                 "    height: 110px;\n" +
                 "    background-image: url(../images/test/images.jpg);\n" +
                 "    background-size: 100px 110px;\n" +
                 "  }\n" +
                 "}\n";
    c.scss_mixin("test/images.jpg", 100, 110, "../images", {is_retina: true}).should.eql(result);
  });
  it("test scss_mixin", function(){
    var result = "@mixin img_test_images(){\n" +
                 "  width: 100px;\n"+
                 "  height: 110px;\n"+
                 "  background-image: url(../images/test/images.jpg);\n"+
                 "  background-size: 100px 110px;\n"+
                 "}\n";
    c.scss_mixin("test/images.jpg", 100, 110, "../images").should.eql(result);
  });
  it("test scss_vars", function(){
    var result = "$img_test_images__width: 100px\n" +
                 "$img_test_images__height: 110px\n";
    c.scss_vars("test/images.jpg", 100, 110).should.eql(result);
  });
  it("test scss", function(){
    var result = "@mixin img_test_images(){\n" +
                 "  width: 100px;\n"+
                 "  height: 110px;\n"+
                 "  background-image: url(../images/test/images.jpg);\n"+
                 "  background-size: 100px 110px;\n"+
                 "}\n" +
                "$img_test_images__width: 100px\n" +
                "$img_test_images__height: 110px\n";
    c.scss("test/images.jpg", 100, 110, "../images").should.eql(result);
  });
  it("test scss with retina", function(){
    var result = "@mixin img_test_images(){\n" +
                 "  @media (min-device-pixel-ratio: 2) and (min-resolution: 192dpi){\n" +
                 "    width: 100px;\n"+
                 "    height: 110px;\n"+
                 "    background-image: url(../images/test/images.jpg);\n"+
                 "    background-size: 100px 110px;\n"+
                 "  }\n" +
                 "}\n" +
                "$img_test_images__width: 100px\n" +
                "$img_test_images__height: 110px\n";
    c.scss("test/images.jpg", 100, 110, "../images", {is_retina: true}).should.eql(result);
  });

});
