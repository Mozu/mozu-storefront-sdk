var fs = require('fs'),
  swig = require('swig'),
  utils = require('../src/utils'),
  overrides = utils.extend(require('../src/object').types, require('../src/collection').types),
  types = require('../src/methods.json'),

  reservedWords = {
    template: true,
    defaultParams: true,
    shortcutParam: true,
    defaults: true,
    verb: true,
    returnType: true,
    noBody: true,
    includeSelf: true,
    collectionOf: true,
    overridePostData: true,
    useIframeTransport: true,
    construct: true,
    postconstruct: true,
  },

  type, methods, methodName, methodConf, override;

for (type in types) {
  methods = types[type];
  if (typeof methods === "string") {
    methods = types[type] = {
      template: methods
    };
  }
  for (methodName in methods) {
    if (!reservedWords[methodName]) {
      methodConf = methods[methodName];
      delete methods[methodName];
      methods[utils.camelCase(methodName)] = methodConf;
    }
  }
  for (override in overrides[type]) {
    if (!reservedWords[override]) {
      methods[override] = overrides[type][override] || {};
      methods[override].isOverride = true;
    }
  }
  if (!methods.get) methods.get = {};
}

fs.writeFileSync('./sdkreference.md', swig.render(fs.readFileSync('./sdkreference_src.tpl', 'utf-8'), {
  locals: {
    types: types,
    reserved: reservedWords
  }
}));

console.log('done, dig on sdkreference.md');
