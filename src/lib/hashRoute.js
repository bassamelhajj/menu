import { useEffect, useState } from 'react'

const parseHash = () => {
  const h = (window.location.hash || '').replace(/^#/, '')
  if (!h || h === '/') return '/'
  const clean = h.replace(/^\/+/, '').split('?')[0]
  return `/${clean}`.replace(/\/+/g, '/')
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseHash)
  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const navigate = (path) => {
  const target = path === '/' ? '#/' : `#${path}`
  if (window.location.hash === target.replace(/^#/, '#')) return
  window.location.hash = target
}

export const goHome = () => navigate('/')