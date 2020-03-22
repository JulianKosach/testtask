"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _glob = _interopRequireDefault(require("glob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ProjectConfig = /*#__PURE__*/function () {
  _createClass(ProjectConfig, null, [{
    key: "parse_multi_values",
    value: function parse_multi_values(items) {
      var result = [];

      if (!items) {
        return result;
      }

      if (typeof items == 'string') {
        items = items.split(items.includes('\n') ? '\n' : ', ');
      }

      var _iterator = _createForOfIteratorHelper(items),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;
          item = item.trim();

          if (item) {
            result.push(item);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return result;
    }
  }]);

  function ProjectConfig(path) {
    _classCallCheck(this, ProjectConfig);

    this.reLines = /[\r\n]+/g;
    this.reComment = /(^\s*;|\s+;|^\s*#).+/;
    this.reSection = /^\[([^\]]+)\]/;
    this.reOptionValue = /^([^=]+)=(.*)/;
    this.reMultiLineValue = /^\s+(.*)/;
    this.reInterpolation = /\$\{([^\.\}]+)\.([^\}]+)\}/g;
    this.path = path;
    this._parsed = [];
    this._data = {};

    if (path) {
      this.read(path);
    }
  }

  _createClass(ProjectConfig, [{
    key: "read",
    value: function read(path) {
      var _this = this;

      if (this._parsed.includes(path)) {
        return;
      }

      this._parsed.push(path);

      var section = null;
      var option = null;

      var _iterator2 = _createForOfIteratorHelper(_fs["default"].readFileSync(path, 'utf-8').split(this.reLines)),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var line = _step2.value;
          // Remove comments
          line = line.replace(this.reComment, '');

          if (!line) {
            continue;
          } // Section


          var mSection = line.match(this.reSection);

          if (mSection) {
            section = mSection[1];

            if (!this._data[section]) {
              this._data[section] = {};
            }

            option = null;
            continue;
          } // Option and value


          var mOptionValue = line.match(this.reOptionValue);

          if (section && mOptionValue) {
            option = mOptionValue[1].trim();
            this._data[section][option] = mOptionValue[2].trim();
            continue;
          } // Multi-line value


          var mMultiLineValue = line.match(this.reMultiLineValue);

          if (option && mMultiLineValue) {
            this._data[section][option] += '\n' + mMultiLineValue[0];
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      this.getlist('platformio', 'extra_configs').forEach(function (pattern) {
        return _glob["default"].sync(pattern).forEach(function (item) {
          return _this.read(item);
        });
      });
    }
  }, {
    key: "getraw",
    value: function getraw(section, option) {
      var _this2 = this;

      if (!this._data[section]) {
        throw "NoSectionError: ".concat(section);
      }

      var value = null;

      if (option in this._data[section]) {
        value = this._data[section][option];
      } else if (section.startsWith('env:')) {
        value = this.get('env', option);
      } else {
        throw "NoOptionError: ".concat(section, " -> ").concat(option);
      }

      if (!value.includes('${') || !value.includes('}')) {
        return value;
      }

      return value.replace(this.reInterpolation, function (_, section, option) {
        return _this2._reInterpolationHandler(section, option);
      });
    }
  }, {
    key: "_reInterpolationHandler",
    value: function _reInterpolationHandler(section, option) {
      if (section == 'sysenv') {
        return process.env[option] || '';
      }

      return this.get(section, option);
    }
  }, {
    key: "sections",
    value: function sections() {
      return Object.keys(this._data);
    }
  }, {
    key: "envs",
    value: function envs() {
      return this.sections().filter(function (item) {
        return item.startsWith('env:');
      }).map(function (item) {
        return item.substring(4);
      });
    }
  }, {
    key: "get",
    value: function get(section, option) {
      var default_ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      try {
        return this.getraw(section, option);
      } catch (err) {
        return default_;
      }
    }
  }, {
    key: "getlist",
    value: function getlist(section, option) {
      var default_ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      return ProjectConfig.parse_multi_values(this.get(section, option, default_));
    }
  }]);

  return ProjectConfig;
}();

exports["default"] = ProjectConfig;