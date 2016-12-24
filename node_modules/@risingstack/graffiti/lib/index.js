'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.express = exports.hapi = exports.koa = undefined;

var _koa = require('./koa');

var _koa2 = _interopRequireDefault(_koa);

var _hapi = require('./hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _express = require('./express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  koa: _koa2.default,
  hapi: _hapi2.default,
  express: _express2.default
};
exports.koa = _koa2.default;
exports.hapi = _hapi2.default;
exports.express = _express2.default;