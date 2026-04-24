import type { Directive, DirectiveBinding } from 'vue'

interface IconSecondaryValue {
  icon: string
  right?: boolean
}

const IconSecondaryDirective: Directive<HTMLElement> = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding<IconSecondaryValue>) {
    let iconClass = `fa fa-${binding.value.icon} text-green-400 text-2xl`

    if (binding.value.right) {
      iconClass += ' float-right'
    }

    el.innerHTML += `<i class="${iconClass}"></i>`
  },
}

export default IconSecondaryDirective
