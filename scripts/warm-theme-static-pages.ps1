$files = @('about.html','customs-data-skill.html','customs-data.html','faq.html','oraskl.html','skill-stats.html','tools.html')
$map = @{
  '#2563eb' = '#b97a52'
  '#1d4ed8' = '#a0653f'
  '#3b82f6' = '#b97a52'
  '#0891b2' = '#d29a63'
  '#0ea5e9' = '#d29a63'
  '#0e7490' = '#b98249'
  '#eff6ff' = '#faf3ea'
  '#bfdbfe' = '#e7d2bd'
  '#a5f3fc' = '#ecdcc4'
  '#f8fbff' = '#faf6f0'
  '#eef6ff' = '#fdf4ea'
  '#dbeafe' = '#ecdcc4'
  'rgba(37, 99, 235,' = 'rgba(185, 122, 82,'
  'rgba(37,99,235,' = 'rgba(185,122,82,'
  '#0f172a' = '#3d3229'
  '#111827' = '#3d3229'
  '#475569' = '#6f6154'
  '#64748b' = '#8a7a6b'
}
$dir = 'D:\26210\NotionNext\public'
foreach ($name in $files) {
  $path = Join-Path $dir $name
  if (-not (Test-Path $path)) { Write-Output "MISS $name"; continue }
  $c = Get-Content $path -Raw -Encoding UTF8
  $orig = $c
  foreach ($k in $map.Keys) {
    $c = $c.Replace($k, $map[$k])
  }
  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($path, $c, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output "OK $name"
  } else {
    Write-Output "NOCHANGE $name"
  }
}
