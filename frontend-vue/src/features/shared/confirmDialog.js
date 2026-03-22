import { reactive } from 'vue'

const defaults = {
  open: false,
  title: 'Bekreft handling',
  message: '',
  details: '',
  warningText: '',
  confirmText: 'Bekreft',
  cancelText: 'Avbryt',
  tone: 'danger'
}

const state = reactive({ ...defaults })

let resolver = null

function resetState() {
  Object.assign(state, defaults)
}

function finalize(result) {
  const currentResolver = resolver
  resolver = null
  resetState()
  if (currentResolver) {
    currentResolver(result)
  }
}

export const confirmDialog = {
  state,
  open(options = {}) {
    if (resolver) {
      resolver(false)
      resolver = null
    }

    Object.assign(state, defaults, options, { open: true })

    if (state.tone === 'danger' && !state.warningText) {
      state.warningText = 'Denne handlingen kan ikke angres.'
    }

    return new Promise((resolve) => {
      resolver = resolve
    })
  },
  confirm() {
    finalize(true)
  },
  cancel() {
    finalize(false)
  }
}