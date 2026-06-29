#!/usr/bin/env node

const { spawn } = require('child_process')
const http = require('http')

const releasePort = Number(process.env.RELEASE_CHECK_PORT || 3100)
const releaseBaseUrl =
  process.env.RELEASE_CHECK_BASE_URL || `http://127.0.0.1:${releasePort}`

async function main() {
  await runCommand('类型检查', 'npm run type-check')
  await runCommand('干净构建', 'npm run build:clean')

  const server = spawn(`npm run start -- -p ${releasePort}`, {
    cwd: process.cwd(),
    env: buildEnv(),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  server.stdout.on('data', data => process.stdout.write(data))
  server.stderr.on('data', data => process.stderr.write(data))

  try {
    await waitForServer(releaseBaseUrl)
    await runCommand('部署自检', 'npm run deploy-check', {
      DEPLOY_CHECK_BASE_URL: releaseBaseUrl
    })
  } finally {
    await stopProcessTree(server)
  }
}

function runCommand(label, command, extraEnv = {}) {
  console.log(`\n▶ ${label}`)

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd: process.cwd(),
      env: buildEnv(extraEnv),
      shell: true,
      stdio: 'inherit'
    })

    child.on('exit', code => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${label}失败，退出码 ${code}`))
    })

    child.on('error', reject)
  })
}

function buildEnv(extraEnv = {}) {
  return Object.fromEntries(
    Object.entries({
      ...process.env,
      ...extraEnv
    }).filter(([key, value]) => key && !key.startsWith('=') && value !== undefined)
  )
}

function waitForServer(url) {
  const startedAt = Date.now()
  const timeoutMs = Number(process.env.RELEASE_CHECK_SERVER_TIMEOUT_MS || 60000)

  console.log(`\n▶ 等待生产服务启动：${url}`)

  return new Promise((resolve, reject) => {
    const tick = () => {
      request(url)
        .then(status => {
          if (status >= 200 && status < 500) {
            resolve()
            return
          }

          retry()
        })
        .catch(retry)
    }

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`生产服务启动超时：${url}`))
        return
      }

      setTimeout(tick, 1000)
    }

    tick()
  })
}

function request(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      res.resume()
      resolve(res.statusCode || 0)
    })

    req.setTimeout(5000, () => {
      req.destroy(new Error('timeout'))
    })

    req.on('error', reject)
  })
}

function stopProcessTree(child) {
  if (!child?.pid || child.killed) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore'
      })
      killer.on('exit', () => resolve())
      killer.on('error', () => resolve())
      return
    }

    child.kill('SIGTERM')
    resolve()
  })
}

main().catch(error => {
  console.error(`\n发布检查未通过：${error.message}`)
  process.exit(1)
})
