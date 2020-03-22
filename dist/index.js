"use strict";

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var conf = new _config["default"]('./platform.ini');
console.log('conf.get("debug", "framework")', conf.get("debug", "framework"));