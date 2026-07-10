import fs from 'node:fs'
import path from 'node:path'

const compatibleViteRange = '^5.2.8 || ^6.0.0'
const packagePath = path.resolve('node_modules/@dcloudio/vite-plugin-uni/package.json')
const hiddenLockPath = path.resolve('node_modules/.package-lock.json')

function updateJson(file, mutate) {
  if (!fs.existsSync(file)) return
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  mutate(json)
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
}

updateJson(packagePath, json => {
  json.peerDependencies = { ...json.peerDependencies, vite: compatibleViteRange }
})

updateJson(hiddenLockPath, json => {
  const entry = json.packages && json.packages['node_modules/@dcloudio/vite-plugin-uni']
  if (entry) entry.peerDependencies = { ...entry.peerDependencies, vite: compatibleViteRange }
})
