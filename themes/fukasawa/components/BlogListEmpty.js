import { useGlobal } from '@/lib/global'

/**
 * 空白博客 列表
 * @returns {JSX.Element}
 * @constructor
 */
const BlogListEmpty = ({ currentSearch }) => {
  const { locale } = useGlobal()
  return <div className='flex items-center justify-center min-h-screen mx-auto md:-mt-20'>
        <p className='text-stone-500 dark:text-stone-300'>{locale.COMMON.NO_RESULTS_FOUND} {(currentSearch && <div>{currentSearch}</div>)}</p>
  </div>
}
export default BlogListEmpty
