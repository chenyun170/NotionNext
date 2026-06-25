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
      className='mb-6 overflow-hidden rounded-[8px] border border-blue-200 bg-blue-50/80 shadow-sm dark:border-blue-900/70 dark:bg-blue-950/30'
      aria-labelledby='customs-data-skill-search-title'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]'>
        <div className='p-5 sm:p-6'>
          <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300'>
            <i className='fas fa-database' />
            <span>Recommended Skill</span>
          </div>
          <h2
            id='customs-data-skill-search-title'
            className='text-xl font-black leading-tight text-zinc-950 dark:text-zinc-50'>
            {CUSTOMS_DATA_SKILL.title}
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300'>
            {CUSTOMS_DATA_SKILL.description}
          </p>
          <p className='mt-2 text-xs leading-6 text-zinc-500 dark:text-zinc-400'>
            适合搜索：海关数据、海关数据 Skill、免费海关数据、美国进口数据、进口商查询、HS 编码。
          </p>
        </div>

        <div className='flex items-center border-t border-blue-100 p-5 dark:border-blue-900/60 lg:border-l lg:border-t-0'>
          <a
            href={CUSTOMS_DATA_SKILL.href}
            onClick={() => trackCustomsDataSkillClick('fukasawa_topic_promo')}
            className='inline-flex w-full items-center justify-center rounded-[8px] bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'>
            <i className='fas fa-arrow-up-right-from-square mr-2 text-xs' />
            打开免费查询
          </a>
        </div>
      </div>
    </section>
  )
}

export default SkillSearchPromo
