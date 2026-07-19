import { getConfig, getPageConfig } from "./config.js";
import { lifecycle } from "./lifecycle.js";
import { loadScript, loadStyle } from "./resources.js";

const api = window.Solitude || {};

Object.defineProperties(api, {
  config: { configurable: true, get: getConfig },
  page: { configurable: true, get: getPageConfig },
});

Object.assign(api, {
  loadScript(url, options) {
    if (/barrage(?:\.min)?\.js(?:\?|$)/.test(url)) api.installLegacyAdapter?.();
    return loadScript(url, options);
  },
  loadStyle,
  on: lifecycle.on.bind(lifecycle),
  listen: lifecycle.listen.bind(lifecycle),
  onPageCleanup: lifecycle.add.bind(lifecycle),
  disposePage: lifecycle.disposePage.bind(lifecycle),
  navigate(url) {
    if (!url) return;
    const instance = api.pjax;
    if (instance?.loadUrl) instance.loadUrl(url);
    else window.location.assign(url);
  },
});

window.Solitude = api;

export { api as Solitude };
