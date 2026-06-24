const DEFAULT_READING_SPEED = 400

export const getReadingMeta = post => {
  const wordCount = normalizeCount(post?.wordCount)
  const readTime = normalizeCount(post?.readTime) || getReadTimeFromWordCount(wordCount)

  return {
    wordCount,
    readTime,
    wordCountLabel: getWordCountLabel(wordCount),
    readTimeLabel: getReadTimeLabel(readTime),
    compactLabel: getCompactReadingLabel(readTime, wordCount),
    isoDuration: readTime ? `PT${readTime}M` : null
  }
}

export const getReadTimeFromWordCount = wordCount => {
  if (!wordCount) {
    return null
  }

  return Math.max(1, Math.ceil(wordCount / DEFAULT_READING_SPEED))
}

export const getReadTimeLabel = readTime => {
  if (!readTime) {
    return null
  }

  return readTime <= 1 ? '1 分钟内' : `约 ${readTime} 分钟`
}

export const getWordCountLabel = wordCount => {
  if (!wordCount) {
    return null
  }

  return `${formatNumber(wordCount)} 字`
}

export const getCompactReadingLabel = (readTime, wordCount) => {
  const parts = [getReadTimeLabel(readTime), getWordCountLabel(wordCount)].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

const normalizeCount = value => {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? Math.round(count) : null
}

const formatNumber = value => new Intl.NumberFormat('zh-CN').format(value)
