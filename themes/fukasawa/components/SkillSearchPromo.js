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
      className='mb-6 overflow-hidden rounded-[8px] border border-amber-200 bg-amber-50/80 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30'
      aria-labelledby='customs-data-skill-search-title'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]'>
        <div className='p-5 sm:p-6'>
          <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300'>
            <i className='fas fa-database' />
            <span>Recommended Skill</span>
          </div>
          <h2
            id='customs-data-skill-search-title'
            className='text-xl font-black leading-tight text-stone-950 dark:text-stone-50'>
            {CUSTOMS_DATA_SKILL.title}
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300'>
            {CUSTOMS_DATA_SKILL.description}
          </p>
          <p className='mt-2 text-xs leading-6 text-stone-500 dark:text-stone-400'>
            适合搜索：海关数据、海关数据 Skill、免费海关数据、美国进口数据、进口商查询、HS 编码。
          </p>
        </div>

        <div className='flex items-center border-t border-amber-100 p-5 dark:border-amber-900/60 lg:border-l lg:border-t-0'>
          <a
            href={CUSTOMS_DATA_SKILL.href}
            onClick={() => trackCustomsDataSkillClick('fukasawa_topic_promo')}
            className='inline-flex w-full items-center justify-center rounded-[8px] bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400'>
            <i className='fas fa-arrow-up-right-from-square mr-2 text-xs' />
            打开免费查询
          </a>
        </div>
      </div>
    </section>
  )
}

export default SkillSearchPromo
