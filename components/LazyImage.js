import { siteConfig } from '@/lib/config'
import { toProxiedImageUrl, withNotionWidth } from '@/lib/utils/imageProxy'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

/**
 * 图片懒加载
 * @param {*} param0
 * @returns
 */
export default function LazyImage({
  priority,
  id,
  src,
  alt,
  placeholderSrc,
  className,
  width,
  height,
  title,
  onLoad,
  onClick,
  style
}) {
  const maxWidth = siteConfig('IMAGE_COMPRESS_WIDTH')
  const defaultPlaceholderSrc = siteConfig('IMG_LAZY_LOAD_PLACEHOLDER')
  const imageRef = useRef(null)
  // priority 首屏图首帧直接输出真实代理地址，避免等客户端水合后才开始请求（影响 LCP）
  const initialPrioritySrc =
    priority && src
      ? toProxiedImageUrl(withNotionWidth(src, maxWidth)) || defaultPlaceholderSrc
      : null
  const [currentSrc, setCurrentSrc] = useState(
    initialPrioritySrc || placeholderSrc || defaultPlaceholderSrc
  )
  // 真实请求地址（已带 width 档位），preload 与 img 必须一致，否则会下载两次
  const [resolvedSrc, setResolvedSrc] = useState(initialPrioritySrc)

  /**
   * 占位图加载成功
   */
  const handleThumbnailLoaded = () => {
    if (priority && currentSrc === initialPrioritySrc) {
      if (imageRef.current) {
        imageRef.current.classList.remove('lazy-image-placeholder')
      }
    }
  }
  // 原图加载完成
  const handleImageLoaded = img => {
    if (typeof onLoad === 'function') {
      onLoad() // 触发传递的onLoad回调函数
    }
    // 移除占位符类名
    if (imageRef.current) {
      imageRef.current.classList.remove('lazy-image-placeholder')
    }
  }
  /**
   * 图片加载失败回调
   */
  const handleImageError = () => {
    if (imageRef.current) {
      // 尝试加载 placeholderSrc，如果失败则加载 defaultPlaceholderSrc
      if (imageRef.current.src !== placeholderSrc && placeholderSrc) {
        imageRef.current.src = placeholderSrc
      } else {
        imageRef.current.src = defaultPlaceholderSrc
      }
      // 移除占位符类名
      if (imageRef.current) {
        imageRef.current.classList.remove('lazy-image-placeholder')
      }
    }
  }

  useEffect(() => {
    // 按实际渲染宽度向 Notion 要图：卡片 400px 就只要 768 档，别拉原图
    const elementWidth = imageRef.current?.getBoundingClientRect?.().width || 0
    const adjustedImageSrc =
      toProxiedImageUrl(
        withNotionWidth(adjustImgSize(src, maxWidth), targetPixelWidth(elementWidth, maxWidth))
      ) || defaultPlaceholderSrc
    setResolvedSrc(adjustedImageSrc)

    // 如果是优先级图片，直接加载
    if (priority) {
      const img = new Image()
      img.src = adjustedImageSrc
      img.onload = () => {
        setCurrentSrc(adjustedImageSrc)
        handleImageLoaded(adjustedImageSrc)
      }
      img.onerror = handleImageError
      return
    }

    // 检查浏览器是否支持IntersectionObserver
    if (!window.IntersectionObserver) {
      // 降级处理：直接加载图片
      const img = new Image()
      img.src = adjustedImageSrc
      img.onload = () => {
        setCurrentSrc(adjustedImageSrc)
        handleImageLoaded(adjustedImageSrc)
      }
      img.onerror = handleImageError
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 预加载图片
            const img = new Image()
            // 设置图片解码优先级
            if ('decoding' in img) {
              img.decoding = 'async'
            }
            img.src = adjustedImageSrc
            img.onload = () => {
              setCurrentSrc(adjustedImageSrc)
              handleImageLoaded(adjustedImageSrc)
            }
            img.onerror = handleImageError

            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: siteConfig('LAZY_LOAD_THRESHOLD', '200px'),
        threshold: 0.1
      }
    )

    const target = imageRef.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [src, maxWidth, priority, defaultPlaceholderSrc])

  // 动态添加width、height和className属性，仅在它们为有效值时添加
  const imgProps = {
    ref: imageRef,
    src: currentSrc,
    'data-src': resolvedSrc || toProxiedImageUrl(src), // 存储代理后的图片地址
    alt: alt || 'Lazy loaded image',
    onLoad: handleThumbnailLoaded,
    onError: handleImageError,
    className: `${className || ''} lazy-image-placeholder`,
    style: {
      backgroundColor: 'rgba(244, 244, 245, 0.85)',
      ...style
    },
    onClick,
    // 性能优化属性
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    ...(priority && { fetchPriority: 'high' }),
    // 现代图片格式支持
    ...(siteConfig('WEBP_SUPPORT') && { 'data-webp': true }),
    ...(siteConfig('AVIF_SUPPORT') && { 'data-avif': true })
  }

  if (id) imgProps.id = id
  if (title) imgProps.title = title
  if (width) imgProps.width = width
  if (height) imgProps.height = height

  if (!src) {
    return null
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...imgProps} />
      {/* 预加载 */}
      {priority && (
        <Head>
          <link
            rel='preload'
            as='image'
            href={resolvedSrc || toProxiedImageUrl(adjustImgSize(src, maxWidth))}
          />
        </Head>
      )}
    </>
  )
}

/**
 * 目标像素宽度：优先用元素实际宽度，取不到再退回屏幕宽度；DPR 封顶 2
 * @param {number} elementWidth
 * @param {number} maxWidth
 * @returns {number}
 */
const targetPixelWidth = (elementWidth, maxWidth) => {
  const screenWidth =
    (typeof window !== 'undefined' && window?.screen?.width) || maxWidth
  const dpr = Math.min(
    (typeof window !== 'undefined' && window?.devicePixelRatio) || 1,
    2
  )
  const rendered = elementWidth > 0 ? elementWidth : Math.min(screenWidth, maxWidth)
  return Math.ceil(rendered * dpr)
}

/**
 * 根据窗口尺寸决定压缩图片宽度
 * @param {*} src
 * @param {*} maxWidth
 * @returns
 */
const adjustImgSize = (src, maxWidth) => {
  if (!src) {
    return null
  }
  const screenWidth =
    (typeof window !== 'undefined' && window?.screen?.width) || maxWidth

  // 屏幕尺寸大于默认图片尺寸，没必要再压缩
  if (screenWidth > maxWidth) {
    return src
  }

  // 正则表达式，用于匹配 URL 中的 width 参数
  const widthRegex = /width=\d+/
  // 正则表达式，用于匹配 URL 中的 w 参数
  const wRegex = /w=\d+/

  // 使用正则表达式替换 width/w 参数
  return src
    .replace(widthRegex, `width=${screenWidth}`)
    .replace(wRegex, `w=${screenWidth}`)
}
