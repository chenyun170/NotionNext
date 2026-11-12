import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const LazyNotionContent = ({ post }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{visible ? <NotionPage post={post} /> : null}</div>
}

export default LazyNotionContent