import type { Router } from 'vue-router'
import NProgress from 'nprogress'

export default (router: Router): void => {
  router.beforeEach((_to, _from, next) => {
    NProgress.start()
    next()
  })

  router.afterEach(NProgress.done)
}
