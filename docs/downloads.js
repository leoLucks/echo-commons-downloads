function officialLink(value) {
  if (typeof value !== 'string' || !value) return undefined
  try {
    const url = new URL(value, location.href)
    if (url.protocol === 'https:' || url.origin === location.origin) return url.href
  } catch {
    return undefined
  }
}

async function showInstaller(entry, channels) {
  const { package: platform, extension } = entry.dataset
  const version = channels.version
  if (!/^v\d+\.\d+\.\d+$/.test(version)) return
  const filename = `echo-commons-${version}-${platform}.${extension}`
  const published = officialLink(channels.packages?.[platform])
  let href
  if (published && new URL(published).pathname.endsWith(`/${filename}`)) {
    href = published
  } else if (channels.localPackages !== false) {
    const local = new URL(`./packages/${filename}`, location.href)
    try {
      const response = await fetch(local, { method: 'HEAD', cache: 'no-cache' })
      if (response.ok && response.headers.get('content-type') === 'application/octet-stream') href = local.href
    } catch {
      return
    }
  }
  if (!href) return
  const link = entry.querySelector('a')
  const destination = new URL(href)
  if (destination.origin === 'https://github.com' &&
      destination.pathname.startsWith('/leoLucks/echo-commons/releases/download/')) {
    const login = new URL('/login', destination.origin)
    login.searchParams.set('return_to', destination.pathname)
    link.href = login.href
    link.textContent = `登录后下载 ${extension.toUpperCase()}`
  } else {
    link.href = href
    link.setAttribute('download', filename)
  }
  link.hidden = false
  entry.querySelector('.package-status').hidden = true
}

async function showChannels() {
  let channels = {}
  try {
    const response = await fetch('./channels.json', { cache: 'no-cache' })
    if (response.ok) channels = await response.json()
  } catch {
    // The Node.js installation link is also available without the manifest.
  }
  if (typeof channels.version === 'string' && channels.version) {
    const version = document.querySelector('[data-version]')
    version.textContent = `当前发行版本 ${channels.version}`
    version.hidden = false
  }
  await Promise.all([...document.querySelectorAll('[data-package]')].map((entry) => showInstaller(entry, channels)))
}

void showChannels()

const topButton = document.querySelector('.record-top')
function updateTopButton() {
  const overflow = Math.max(0, document.documentElement.scrollHeight - innerHeight)
  const offset = Math.min(overflow, Math.max(0, scrollY))
  topButton.hidden = overflow <= 2 || offset < Math.min(220, overflow / 3)
  topButton.style.setProperty('--cd-scroll-offset', offset)
}
addEventListener('scroll', updateTopButton, { passive: true })
addEventListener('resize', updateTopButton)
topButton.addEventListener('click', () => {
  document.querySelector('#top').focus({ preventScroll: true })
  scrollTo({ top: 0 })
})
updateTopButton()
