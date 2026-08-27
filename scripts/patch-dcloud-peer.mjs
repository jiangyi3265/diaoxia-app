import fs from 'node:fs'
import path from 'node:path'

const peerPatches = [
  {
    packagePath: 'node_modules/@dcloudio/vite-plugin-uni/package.json',
    lockPath: 'node_modules/@dcloudio/vite-plugin-uni',
    viteRange: '^5.2.8 || ^6.0.0'
  },
  {
    packagePath: 'node_modules/@dcloudio/vite-plugin-uni/node_modules/@vitejs/plugin-legacy/package.json',
    lockPath: 'node_modules/@dcloudio/vite-plugin-uni/node_modules/@vitejs/plugin-legacy',
    viteRange: '^5.0.0 || ^6.0.0'
  },
  {
    packagePath: 'node_modules/@dcloudio/vite-plugin-uni/node_modules/@vitejs/plugin-vue-jsx/package.json',
    lockPath: 'node_modules/@dcloudio/vite-plugin-uni/node_modules/@vitejs/plugin-vue-jsx',
    viteRange: '^4.0.0 || ^5.0.0 || ^6.0.0'
  }
]
const hiddenLockPath = path.resolve('node_modules/.package-lock.json')

function updateJson(file, mutate) {
  if (!fs.existsSync(file)) return
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  mutate(json)
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
}

for (const patch of peerPatches) {
  updateJson(path.resolve(patch.packagePath), json => {
    json.peerDependencies = { ...json.peerDependencies, vite: patch.viteRange }
  })
}

updateJson(hiddenLockPath, json => {
  for (const patch of peerPatches) {
    const entry = json.packages && json.packages[patch.lockPath]
    if (entry) entry.peerDependencies = { ...entry.peerDependencies, vite: patch.viteRange }
  }
})
