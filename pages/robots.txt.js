export async function getServerSideProps({ res }) {
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://www.123170.xyz/sitemap.xml
`.trim()

  res.setHeader('Content-Type', 'text/plain')
  res.write(robotsTxt)
  res.end()

  return {
    props: {}
  }
}

export default function Robots() {
  return null
}
