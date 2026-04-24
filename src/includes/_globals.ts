import type { App, Component } from 'vue'
import { camelCase, upperFirst } from 'lodash-es'

export default {
  install(app: App) {
    const baseComponents: Record<string, { default?: Component; [key: string]: unknown }> =
      import.meta.glob('../components/base/*.vue', { eager: true })

    Object.entries(baseComponents).forEach(([path, module]) => {
      const fileName = path.split('/').pop() ?? ''
      const componentName = upperFirst(
        camelCase(fileName.replace(/\.\w+$/, ''))
      )

      app.component(`Base${componentName}`, module.default ?? module)
    })
  },
}
