import type { Directive, DirectiveBinding } from 'vue'

const IconDirective: Directive<HTMLElement> = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding<string>) {
    let iconClass = `fa fa-${binding.value} text-2xl`

    if (binding.arg === 'full') {
      iconClass = binding.value
    }

    if (binding.modifiers.right) {
      iconClass += ' float-right'
    }

    if (binding.modifiers.yellow) {
      iconClass += ' text-yellow-400'
    } else {
      iconClass += ' text-green-400'
    }

    el.innerHTML += `<i class="${iconClass}"></i>`
  },
}

export default IconDirective
