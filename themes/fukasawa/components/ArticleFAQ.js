import { buildArticleFAQs } from '@/lib/utils/articleFAQ'

const ArticleFAQ = ({ post }) => {
  const faqs = buildArticleFAQs(post)

  if (!faqs.length) {
    return null
  }

  return (
    <section className='mt-12 print:hidden' aria-label='常见问题'>
      <div className='mb-5'>
        <div className='mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
          <i className='fas fa-circle-question' />
          <span>FAQ</span>
        </div>
        <h2 className='text-2xl font-black text-stone-900 dark:text-stone-50'>
          读者常见问题
        </h2>
      </div>

      <div className='space-y-3'>
        {faqs.map(item => (
          <details
            key={item.question}
            className='group rounded-[8px] border border-stone-200 bg-white p-4 open:border-stone-400 dark:border-stone-800 dark:bg-[#1c1917] dark:open:border-stone-700'>
            <summary className='flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-stone-900 dark:text-stone-100'>
              <span>{item.question}</span>
              <i className='fas fa-chevron-down text-xs text-stone-400 transition group-open:rotate-180' />
            </summary>
            <p className='mt-3 leading-7 text-stone-600 dark:text-stone-300'>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default ArticleFAQ
