/**
 * 根据 URL 推断网络请求类型（对齐 DevTools Network 分类）
 */

export const REQUEST_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'fetch', label: 'Fetch/XHR' },
  { value: 'doc', label: 'Doc' },
  { value: 'img', label: 'Img' },
  { value: 'media', label: 'Media' },
  { value: 'font', label: 'Font' },
  { value: 'ws', label: 'WS' },
  { value: 'wasm', label: 'Wasm' },
  { value: 'manifest', label: 'Manifest' },
  { value: 'other', label: 'Other' }
] as const

export type RequestType = (typeof REQUEST_TYPE_OPTIONS)[number]['value']

export function inferRequestType(url: string): RequestType {
  try {
    const u = new URL(url)
    const pathname = u.pathname.toLowerCase()
    const search = u.search.toLowerCase()
    const full = pathname + search

    if (u.protocol === 'ws:' || u.protocol === 'wss:') return 'ws'

    const ext = pathname.includes('.') ? pathname.split('.').pop() || '' : ''

    const imgExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif']
    if (imgExts.includes(ext)) return 'img'

    const mediaExts = ['mp4', 'mp3', 'webm', 'wav', 'ogg', 'm4a', 'flac', 'mov', 'mkv']
    if (mediaExts.includes(ext)) return 'media'

    const fontExts = ['woff', 'woff2', 'ttf', 'otf', 'eot']
    if (fontExts.includes(ext)) return 'font'

    if (ext === 'wasm') return 'wasm'

    if (ext === 'json' && full.includes('manifest')) return 'manifest'

    if (ext === 'css') return 'other'

    const docExts = ['html', 'htm', 'php', 'jsp', 'asp', 'aspx']
    if (pathname === '/' || docExts.includes(ext)) return 'doc'

    // 常见 API 路径推断为 fetch/xhr
    if (ext === 'json' || pathname.includes('/api/') || pathname.includes('/rest/') || pathname.includes('/graphql') || pathname.includes('/rpc/')) {
      return 'fetch'
    }

    return 'other'
  } catch {
    return 'other'
  }
}
