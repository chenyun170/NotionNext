import { useEffect, useState } from 'react'

const ArticleReadingProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const article = document.getElementById('article-wrapper')
      if (!article) {
        setProgress(0)
        return
      }

      const rect = article.getBoundingClientRect()
      const total = Math.max(article.scrollHeight - window.innerHeight, 1)
      const read = Math.min(Math.max(-rect.top, 0), total)
      setProgress(Math.round((read / total) * 100))
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div className='fixed left-0 top-0 z-50 h-1 w-full bg-transparent print:hidden'>
      <div
        className='h-full bg-emerald-500 transition-[width] duration-150 ease-out dark:bg-emerald-400'
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ArticleReadingProgress
