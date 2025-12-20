<div className='christmas-container'>
  {/* 1. 圣诞帽 (修正了 mixBlendMode 报错) */}
  {showChristmas && (
    <img 
      src='https://cloudflare-imgbed-aa9.pages.dev/file/1766201111415_hat.png' 
      className='santa-hat' 
      style={{ 
        top: '-18px', 
        left: '24px', 
        width: '42px', 
        transform: 'rotate(5deg)', 
        mixBlendMode: 'multiply',
        zIndex: 30 
      }}
      alt='Christmas Hat' 
    />
  )}

  {/* 2. Logo 主图 */}
  <img 
    src='/logo.png' 
    className='w-16 h-16 mb-3 object-contain relative z-10' 
    alt={siteConfig('TITLE')} 
  />

  {/* 3. 雪花层 (z-index 设为最高 50) */}
  {showChristmas && (
    <div className='snow-wrapper' style={{ zIndex: 50 }}>
      <span className='snowflake' style={{left: '10%', animationDuration: '2.5s'}}>❄</span>
      <span className='snowflake' style={{left: '40%', animationDuration: '3.5s', animationDelay: '1s'}}>❅</span>
      <span className='snowflake' style={{left: '70%', animationDuration: '3s', animationDelay: '0.5s'}}>❆</span>
      <span className='snowflake' style={{left: '85%', animationDuration: '4.5s', animationDelay: '2s'}}>❄</span>
    </div>
  )}
</div>
