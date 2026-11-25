const Module = require('module')
const path = require('path')

const canvasMockPath = path.resolve(__dirname, '__mocks__/canvas.js')
const originalLoad = Module._load

function installCanvasMock() {
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'canvas') {
      return originalLoad.call(this, canvasMockPath, parent, isMain)
    }
    return originalLoad.apply(this, arguments)
  }
}

installCanvasMock()
let JSDOMEnvironment
try {
  JSDOMEnvironment = require('jest-environment-jsdom').default || require('jest-environment-jsdom')
} finally {
  Module._load = originalLoad
}

class SafeJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    installCanvasMock()
    try {
      super(config, context)
    } finally {
      Module._load = originalLoad
    }
  }
}

module.exports = SafeJSDOMEnvironment
