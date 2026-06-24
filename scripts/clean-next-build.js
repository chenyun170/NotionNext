#!/usr/bin/env node

const fs = require('fs')
const net = require('net')
const path = require('path')

const root = process.cwd()
const nextDir = path.join(root, '.next')
const port = Number(process.env.CLEAN_BUILD_PORT || 3000)
const skipActiveServerCheck = process.env.CLEAN_BUILD_ALLOW_ACTIVE_SERVER === 'true'

async function main() {
  if (!skipActiveServerCheck && await isPortOpen(port)) {
    console.error(`检测到本地 ${port} 端口仍在运行。`)
    console.error('请先停止 `npm run dev`，再执行 `npm run build:clean`。')
    console.error('如确认不是当前项目，可设置 `CLEAN_BUILD_ALLOW_ACTIVE_SERVER=true` 跳过检查。')
    process.exit(1)
  }

  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 200
    })
    console.log('已清理 `.next` 构建缓存。')
  } else {
    console.log('未发现 `.next` 构建缓存，跳过清理。')
  }
}

function isPortOpen(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port })

    socket.setTimeout(500)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => resolve(false))
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
