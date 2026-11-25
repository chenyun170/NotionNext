/** @jest-environment node */

import { EventEmitter } from 'events'
import OpenAI from 'openai'
import image from '@/pages/api/img'
import chat from '@/pages/api/chat'
import diagnose from '@/pages/api/diagnose'
import models from '@/pages/api/models'
import subscribe from '@/pages/api/subscribe'

jest.mock('openai', () => ({ __esModule: true, default: jest.fn() }))

const source = 'https://www.notion.so/image/example'
const mockFetch = jest.fn()
const originalFetch = global.fetch
const originalChatKey = process.env.OPENAI_API_KEY
const originalChatBaseUrl = process.env.OPENAI_BASE_URL
const originalChatModel = process.env.CHAT_MODEL
const originalDiagnoseKey = process.env.BLAZEAI_API_KEY

function response() {
  const res = new EventEmitter()
  res.setHeader = jest.fn()
  res.status = jest.fn(() => res)
  res.send = jest.fn()
  res.json = jest.fn()
  res.redirect = jest.fn()
  res.write = jest.fn()
  res.end = jest.fn(() => {
    res.writableEnded = true
  })
  return res
}

const upstreamResponse = ({
  status = 200,
  headers = {},
  body = null
} = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  headers: { get: name => headers[name.toLowerCase()] || null },
  body,
  text: jest.fn()
})

const streamBody = chunks => {
  let index = 0
  const cancel = jest.fn(async () => {})
  return {
    cancel,
    getReader: () => ({
      read: jest.fn(async () =>
        index < chunks.length
          ? { done: false, value: chunks[index++] }
          : { done: true }
      ),
      cancel,
      releaseLock: jest.fn()
    })
  }
}

beforeEach(() => {
  global.fetch = mockFetch
  mockFetch.mockReset()
  OpenAI.mockReset()
  process.env.OPENAI_API_KEY = 'test-only'
  process.env.OPENAI_BASE_URL = 'https://integrate.api.nvidia.com/v1'
  process.env.CHAT_MODEL = 'minimaxai/minimax-m3.1-flash'
  process.env.BLAZEAI_API_KEY = 'test-only'
})

afterEach(() => {
  global.fetch = originalFetch
  if (originalChatKey === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = originalChatKey
  if (originalChatBaseUrl === undefined) delete process.env.OPENAI_BASE_URL
  else process.env.OPENAI_BASE_URL = originalChatBaseUrl
  if (originalChatModel === undefined) delete process.env.CHAT_MODEL
  else process.env.CHAT_MODEL = originalChatModel
  if (originalDiagnoseKey === undefined) delete process.env.BLAZEAI_API_KEY
  else process.env.BLAZEAI_API_KEY = originalDiagnoseKey
  jest.useRealTimers()
})

test('serves a raster image after an approved redirect', async () => {
  mockFetch
    .mockResolvedValueOnce(
      upstreamResponse({ status: 302, headers: { location: '/image/next' } })
    )
    .mockResolvedValueOnce(
      upstreamResponse({
        headers: { 'content-type': 'image/png' },
        body: streamBody([new Uint8Array([1, 2])])
      })
    )
  const res = response()
  await image({ method: 'GET', query: { u: source } }, res)
  expect(mockFetch).toHaveBeenLastCalledWith(
    'https://www.notion.so/image/next',
    expect.objectContaining({ redirect: 'manual' })
  )
  expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png')
  expect(res.send).toHaveBeenCalledWith(Buffer.from([1, 2]))
})

test('does not fetch an unapproved redirect destination', async () => {
  mockFetch.mockResolvedValue(
    upstreamResponse({
      status: 302,
      headers: { location: 'https://example.invalid/image.png' }
    })
  )
  const res = response()
  await image({ method: 'GET', query: { u: source } }, res)
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<svg'))
})

test('does not serve upstream SVG', async () => {
  const svg = '<svg id="upstream"/>'
  mockFetch.mockResolvedValue(
    upstreamResponse({
      headers: { 'content-type': 'image/svg+xml' },
      body: streamBody([Buffer.from(svg)])
    })
  )
  const res = response()
  await image({ method: 'GET', query: { u: source } }, res)
  expect(res.send).not.toHaveBeenCalledWith(svg)
  expect(res.setHeader).toHaveBeenCalledWith(
    'Content-Security-Policy',
    expect.stringContaining('sandbox')
  )
})

test('cancels an oversized image without a content length', async () => {
  const body = streamBody([new Uint8Array(4 * 1024 * 1024 + 1)])
  mockFetch.mockResolvedValue(
    upstreamResponse({ headers: { 'content-type': 'image/png' }, body })
  )
  const res = response()
  await image({ method: 'GET', query: { u: source } }, res)
  expect(body.cancel).toHaveBeenCalled()
  expect(res.redirect).toHaveBeenCalledWith(302, source)
})

test('chat sends streamed text and the completion marker', async () => {
  const create = jest.fn(async () => [
    { choices: [{ delta: { content: 'hello' } }] }
  ])
  OpenAI.mockImplementation(() => ({ chat: { completions: { create } } }))
  const res = response()
  await chat(
    { method: 'POST', headers: {}, socket: {}, body: { message: 'hello' } },
    res
  )
  expect(res.write).toHaveBeenCalledWith('data: {"content":"hello"}\n\n')
  expect(res.end).toHaveBeenCalledWith('data: [DONE]\n\n')
  expect(res.listenerCount('close')).toBe(0)
})

const rejectOnAbort = signal =>
  new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), {
      once: true
    })
  })

test.each(['deadline', 'disconnect'])(
  'chat cancels the upstream on %s',
  async reason => {
    jest.useFakeTimers()
    const create = jest.fn((_, { signal }) => rejectOnAbort(signal))
    OpenAI.mockImplementation(() => ({ chat: { completions: { create } } }))
    const res = response()
    const pending = chat(
      { method: 'POST', headers: {}, socket: {}, body: { message: 'hello' } },
      res
    )
    if (reason === 'deadline') jest.advanceTimersByTime(120000)
    else {
      res.destroyed = true
      res.emit('close')
    }
    await pending
    expect(create.mock.calls[0][1].signal.aborted).toBe(true)
    expect(res.end).toHaveBeenCalledTimes(reason === 'deadline' ? 1 : 0)
    expect(res.listenerCount('close')).toBe(0)
  }
)

test('diagnosis still times out while reading the upstream body', async () => {
  jest.useFakeTimers()
  mockFetch.mockImplementation(async (_, { signal }) => ({
    ok: true,
    status: 200,
    text: () => rejectOnAbort(signal)
  }))
  const res = response()
  const pending = diagnose(
    {
      method: 'POST',
      body: { privacyConfirmed: true, form: { letterContent: 'hello' } },
      headers: {}
    },
    res
  )
  await jest.advanceTimersByTimeAsync(120000)
  await pending
  expect(mockFetch.mock.calls[0][1].signal.aborted).toBe(true)
  expect(res.status).toHaveBeenCalledWith(504)
  expect(res.listenerCount('close')).toBe(0)
})

test('models endpoint requires bearer token when configured', async () => {
  const prevEnv = process.env.NODE_ENV
  const prevToken = process.env.MODELS_DIAG_TOKEN
  process.env.NODE_ENV = 'production'
  process.env.MODELS_DIAG_TOKEN = 'secret-diag-token'

  try {
    const unauthRes = response()
    await models({ method: 'GET', headers: {}, query: {} }, unauthRes)
    expect(unauthRes.status).toHaveBeenCalledWith(401)

    const list = jest.fn(() => Promise.resolve({ data: [{ id: 'nvidia/nemotron-3.5-bolt-e4b' }] }))
    OpenAI.mockImplementation(() => ({ models: { list } }))
    const authRes = response()
    await models(
      { method: 'GET', headers: { authorization: 'Bearer secret-diag-token' }, query: {} },
      authRes
    )
    expect(authRes.status).toHaveBeenCalledWith(200)
    expect(authRes.json).toHaveBeenCalledWith({
      count: 1,
      models: ['nvidia/nemotron-3.5-bolt-e4b']
    })
  } finally {
    process.env.NODE_ENV = prevEnv
    if (prevToken === undefined) delete process.env.MODELS_DIAG_TOKEN
    else process.env.MODELS_DIAG_TOKEN = prevToken
  }
})

test('subscribe rejects invalid email without calling Mailchimp', async () => {
  const res = response()
  await subscribe({ method: 'POST', body: { email: 'not-an-email' } }, res)
  expect(res.status).toHaveBeenCalledWith(400)
  expect(mockFetch).not.toHaveBeenCalled()
})
