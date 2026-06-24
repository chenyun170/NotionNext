import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

const loadAlgoliaSearchModal = () =>
  import('@/components/AlgoliaSearchModal').then(module => module.default || module)

export default function DeferredAlgoliaSearchModal({ cRef, enabled }) {
  const [ModalComponent, setModalComponent] = useState(null)
  const [pendingOpen, setPendingOpen] = useState(false)
  const modalRef = useRef(null)
  const importPromiseRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const ensureModal = useCallback(() => {
    if (!enabled) {
      return Promise.resolve(null)
    }

    if (ModalComponent) {
      return Promise.resolve(ModalComponent)
    }

    if (!importPromiseRef.current) {
      importPromiseRef.current = loadAlgoliaSearchModal()
    }

    return importPromiseRef.current.then(LoadedModal => {
      if (mountedRef.current) {
        setModalComponent(() => LoadedModal)
      }

      return LoadedModal
    })
  }, [ModalComponent, enabled])

  const openSearch = useCallback(() => {
    if (!enabled) {
      return
    }

    setPendingOpen(true)
    void ensureModal()
  }, [enabled, ensureModal])

  useImperativeHandle(
    cRef,
    () => ({
      openSearch,
      preload: ensureModal
    }),
    [ensureModal, openSearch]
  )

  useEffect(() => {
    if (!pendingOpen || !ModalComponent) {
      return
    }

    const timer = setTimeout(() => {
      modalRef.current?.openSearch()
      setPendingOpen(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [ModalComponent, pendingOpen])

  if (!enabled || !ModalComponent) {
    return null
  }

  return <ModalComponent cRef={modalRef} />
}
