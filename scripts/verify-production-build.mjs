import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const expectedAppId = 'wx62712d7f9c391049'
const expectedApiBaseUrl = 'https://diaox.daioxia.cn'
const outputDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'unpackage', 'dist', 'build', 'mp-weixin')
const textExtensions = new Set(['.js', '.json', '.wxml', '.wxss'])
const forbiddenPatterns = [
  { label: 'localhost', pattern: /(?:localhost|127\.0\.0\.1)/i },
  { label: 'private-network IPv4 address', pattern: /(?:^|[^\d])(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?:[^\d]|$)/ },
  { label: 'development log WebSocket', pattern: /开发模式下日志通道|WebSocket connection to ['"]ws:\/\//i },
  { label: 'old mini-program AppID', pattern: /wx56d182594c05ce23/ },
]

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectTextFiles(absolutePath))
    else if (textExtensions.has(path.extname(entry.name))) files.push(absolutePath)
  }
  return files
}

const projectConfig = JSON.parse(await readFile(path.join(outputDir, 'project.config.json'), 'utf8'))
if (projectConfig.appid !== expectedAppId) {
  throw new Error(`Production AppID mismatch: expected ${expectedAppId}`)
}
if (projectConfig.setting?.urlCheck !== true) {
  throw new Error('Production domain validation must remain enabled (setting.urlCheck=true)')
}

let apiDomainFound = false
for (const file of await collectTextFiles(outputDir)) {
  const content = await readFile(file, 'utf8')
  if (content.includes(expectedApiBaseUrl)) apiDomainFound = true
  for (const { label, pattern } of forbiddenPatterns) {
    if (pattern.test(content)) {
      throw new Error(`Production build contains ${label}: ${path.relative(outputDir, file)}`)
    }
  }
}
if (!apiDomainFound) throw new Error(`Production API domain missing: ${expectedApiBaseUrl}`)

console.log(`Production mini-program verified: AppID=${expectedAppId}, API=${expectedApiBaseUrl}, no local debug socket.`)
