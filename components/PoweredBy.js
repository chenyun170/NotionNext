import { siteConfig } from '@/lib/config'

export default function PoweredBy(props) {
  return (
    <div className={`inline text-sm font-serif ${props.className || ''}`}>
      <span className='mr-1'>© 2025 cy. All Rights Reserved.</span>
    </div>
  )
}
