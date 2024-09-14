import type { Plugin } from 'vue'
import { Watermark } from './components/watermark'
import { InjectionOptions } from './components/watermark/options'
import type { wmOptions } from './components/watermark/attribute'

export default function WatermarkPlugin(defaultOptions: wmOptions = {}): Plugin {
  return {
    // TODO: better type
    install(app: any) {
      app.provide(InjectionOptions, defaultOptions)
      app.component('Watermark', Watermark)
    },
  }
}