const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const extDir = path.resolve(__dirname, '..', 'browser-extension')
const publicDir = path.resolve(__dirname, '..', 'public')

function zipExtension(targetName, manifestSource) {
  const tmpDir = path.join(__dirname, '..', 'tmp', `ext-${targetName}`)
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  // clean tmpDir contents
  fs.readdirSync(tmpDir).forEach(f => {
    const p = path.join(tmpDir, f)
    fs.rmSync(p, { recursive: true, force: true })
  })

  // copy all files from browser-extension
  const files = fs.readdirSync(extDir)
  files.forEach(f => {
    const src = path.join(extDir, f)
    const dest = path.join(tmpDir, f)
    fs.cpSync(src, dest, { recursive: true })
  })

  // use the specified manifest
  const manifestSrc = path.join(tmpDir, manifestSource)
  const manifestDest = path.join(tmpDir, 'manifest.json')
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest)
  } else {
    console.warn(`Manifest source not found: ${manifestSrc}`)
  }

  // remove extra manifest files
  ;['manifest-chrome.json', 'manifest-firefox.json'].forEach(f => {
    const p = path.join(tmpDir, f)
    if (fs.existsSync(p)) fs.unlinkSync(p)
  })

  // create zip in public
  const outZip = path.join(publicDir, `browser-extension-${targetName}.zip`)
  if (fs.existsSync(outZip)) fs.unlinkSync(outZip)

  // use PowerShell Compress-Archive on Windows
  const psCmd = `Compress-Archive -Path "${tmpDir}\\*" -DestinationPath "${outZip}"`
  execSync(psCmd, { shell: 'powershell.exe' })
  console.log(`Created ${outZip}`)
}

zipExtension('chrome', 'manifest-chrome.json')
zipExtension('firefox', 'manifest-firefox.json')
