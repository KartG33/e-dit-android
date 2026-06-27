Add-Type -AssemblyName System.Drawing
$sourcePath = ".\icon.png"
$outDir = ".\public\icons"

if (-not (Test-Path $outDir)) { 
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$img = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, $size, $size)
    $graph.Dispose()
    
    $outPath = Join-Path $outDir "icon-$size`x$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated $outPath"
}

$img.Dispose()
Write-Host "PWA icons generation complete!"
