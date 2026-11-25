import {
  CUSTOMS_DATA_SKILL,
  shouldShowCustomsDataSkill
} from '@/lib/utils/customsDataSkill'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const SkillSearchPromo = ({ keyword, forceShow = false }) => {
  if (!forceShow && !shouldShowCustomsDataSkill(keyword)) {
    return null
  }

  return (
    <section
      className='mb-6 overflow-hidden rounded-2xl border border-[#c3d6cd] bg-[#f4f8f6] shadow-xs dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/15'
      aria-labelledby='customs-data-skill-search-title'
    >
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_230px]'>
        <div className='p-5 sm:p-6'>
          <div className='mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c5a4a] dark:bg-[#1c1a17] dark:text-[#6bc4a6]'>
            <i className='fas fa-database text-[10px]' />
            <span>Recommended Tool</span>
          </div>
          <h2
            id='customs-data-skill-search-title'
            className='text-lg font-extrabold leading-tight text-stone-950 dark:text-stone-50 sm:text-xl'
          >
            {CUSTOMS_DATA_SKILL.title}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300'>
            {CUSTOMS_DATA_SKILL.description}
          </p>
          <p className='mt-1.5 text-xs leading-6 text-stone-500 dark:text-stone-400'>
            适用场景：海关数据查询、免费海关数据、美国进口数据、进口商筛选、HS 编码验证。
          </p>
        </div>

        <div className='flex items-center border-t border-[#c3d6cd]/60 p-5 dark:border-[#2d6f5d]/60 lg:border-l lg:border-t-0'>
          <a
            href={CUSTOMS_DATA_SKILL.href}
            onClick={() => trackCustomsDataSkillClick('fukasawa_topic_promo')}
            className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c5a4a] px-4 py-3 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-[#14453a]'
          >
            <i className='fas fa-arrow-up-right-from-square text-xs' />
            打开免费查询
          </a>
        </div>
      </div>
    </section>
  )
}

export default SkillSearchPromo
