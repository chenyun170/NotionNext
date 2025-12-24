// themes/fukasawa/lib/theme.js
// 统一管理主题样式配置

export const colors = {
    // 品牌主色
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    
    // 辅助色
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c'
    },
    
    // 功能色
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // 渐变
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      card: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)'
    }
  }
  
  export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem'     // 64px
  }
  
  export const borderRadius = {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px'
  }
  
  export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(59, 130, 246, 0.4)'
  }
  
  export const typography = {
    fontFamily: {
      sans: 'system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, monospace'
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem'    // 60px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
  
  export const animations = {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
  
  // 预设组件样式
  export const componentStyles = {
    card: {
      base: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800',
      hover: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
      padding: 'p-6',
      full: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
    },
    
    button: {
      primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300',
      secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300',
      outline: 'border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300',
      ghost: 'text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300'
    },
    
    badge: {
      primary: 'px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium',
      secondary: 'px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium',
      success: 'px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium',
      gray: 'px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs font-medium'
    },
    
    input: {
      base: 'w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300',
      error: 'border-red-500 focus:ring-red-500'
    },
    
    link: {
      base: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors',
      underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all hover:after:w-full'
    }
  }
  
  // 工具函数
  export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ')
  }
  
  export const getGradient = (type = 'primary') => {
    return colors.gradients[type] || colors.gradients.primary
  }
  
  export const getShadow = (size = 'md') => {
    return shadows[size] || shadows.md
  }
  
  export default {
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
    animations,
    componentStyles,
    cn,
    getGradient,
    getShadow
  }