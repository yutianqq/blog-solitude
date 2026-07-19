/**
 * Solitude
 * inject is to head
 */

"use strict";

hexo.extend.helper.register("inject_head_js", function () {
  const createJS = () => `
        const parseConfig = (id) => {
            const element = document.getElementById(id)
            if (!element) return {}
            try {
                return JSON.parse(element.content?.textContent || element.textContent || '{}')
            } catch (error) {
                console.error('Invalid Solitude config:', error)
                return {}
            }
        }
        const saveToLocal = {
            set: function setWithExpiry(key, value, ttl) {
                if (ttl === 0)
                    return
                const now = new Date()
                const expiryDay = ttl * 86400000
                const item = {
                    value: value,
                    expiry: now.getTime() + expiryDay
                }
                localStorage.setItem(key, JSON.stringify(item))
            },
            get: function getWithExpiry(key) {
                const itemStr = localStorage.getItem(key)

                if (!itemStr) {
                    return undefined
                }
                let item
                try {
                    item = JSON.parse(itemStr)
                } catch (error) {
                    localStorage.removeItem(key)
                    return undefined
                }
                const now = new Date()

                if (now.getTime() > item.expiry) {
                    localStorage.removeItem(key)
                    return undefined
                }
                return item.value
            }
        };
        const resourceRequests = new Map()
        const loadResource = (url, create) => {
            const absoluteUrl = new URL(url, document.baseURI).href
            if (resourceRequests.has(absoluteUrl)) return resourceRequests.get(absoluteUrl)
            const request = new Promise((resolve, reject) => {
                const element = create(absoluteUrl)
                element.addEventListener('load', () => resolve(element), {once: true})
                element.addEventListener('error', () => {
                    resourceRequests.delete(absoluteUrl)
                    reject(new Error('Unable to load ' + absoluteUrl))
                }, {once: true})
                document.head.appendChild(element)
            })
            resourceRequests.set(absoluteUrl, request)
            return request
        }
        const api = window.Solitude || {}
        window.Solitude = api
        api.installLegacyAdapter = () => {
            const aliases = {
                utils: api,
                sco: api,
                GLOBAL_CONFIG: api.config
            }
            Object.entries(aliases).forEach(([name, value]) => {
                if (name in window) return
                Object.defineProperty(window, name, {
                    configurable: true,
                    enumerable: false,
                    value
                })
            })
        }
        Object.defineProperties(api, {
            config: {configurable: true, get: () => parseConfig('site-config')},
            page: {configurable: true, get: () => parseConfig('config-diff')}
        })
        Object.assign(api, {
            saveToLocal: saveToLocal,
            loadStyle: (url, options = {}) => loadResource(url, href => {
                const link = document.createElement('link')
                link.rel = 'stylesheet'
                link.href = href
                if (options.id) link.id = options.id
                return link
            }),
            loadScript: (url, options = {}) => {
              if (url.includes('barrage')) api.installLegacyAdapter()
              return loadResource(url, src => {
                const script = document.createElement('script')
                script.src = src
                script.async = options.async !== false
                Object.entries(options.attributes || {}).forEach(([key, value]) => script.setAttribute(key, value))
                return script
              })
            },
            addGlobalFn: (key, fn, name = false, parent = window) => {
                const globalFn = parent.globalFn || {}
                const keyObj = globalFn[key] || {}

                if (name && keyObj[name]) return

                name = name || Object.keys(keyObj).length
                keyObj[name] = fn
                globalFn[key] = keyObj
                parent.globalFn = globalFn
            },
            addEventListenerPjax: (ele, event, fn, option = false) => {
              ele.addEventListener(event, fn, option)
              api.addGlobalFn('pjax', () => {
                  ele.removeEventListener(event, fn, option)
              })
            },
            diffDateFormat: (selector) => {
                selector.forEach(item => {
                    const date = new Date(item.getAttribute('datetime') || item.textContent);
                    item.textContent = (date.getMonth() + 1).toString()+'/'+date.getDate().toString();
                });
            },
        })
        api.getCSS = (url, id = false) => api.loadStyle(url, {id})
        api.getScript = (url, attr = {}) => api.loadScript(url, {attributes: attr})
        api.on = (name, handler) => {
            const eventName = 'solitude:' + name
            document.addEventListener(eventName, handler)
            return () => document.removeEventListener(eventName, handler)
        }
        api.navigate = url => api.pjax?.loadUrl ? api.pjax.loadUrl(url) : window.location.assign(url)
    `;
  return `<script>(()=>{${createJS()}})()</script>`;
});

hexo.extend.helper.register("packageVersion", function () {
  const { version } = require("../../package.json");
  return version;
});
