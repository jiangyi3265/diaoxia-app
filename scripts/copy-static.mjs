import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve('static')
const outputRoot = process.env.UNI_OUTPUT_DIR || resolve('unpackage/dist/build/mp-weixin')
const target = resolve(outputRoot, 'static')

if (!existsSync(source)) {
  throw new Error(`静态资源目录不存在：${source}`)
}

rmSync(target, { recursive: true, force: true })
mkdirSync(outputRoot, { recursive: true })
cpSync(source, target, { recursive: true })

console.log(`Static assets copied to ${target}`)
