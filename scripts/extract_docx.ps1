Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = "D:\PROJEKAN\dcn-opshub-project-scaffold\project\PT_Daff_Cargo_Nusantara_Flowchart.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlContent = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlContent
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = @()
foreach ($p in $paragraphs) {
    $textNodes = $p.SelectNodes(".//w:t", $ns)
    $text = ($textNodes | ForEach-Object { $_.InnerText }) -join ""
    if ($text.Trim()) {
        $lines += $text
    }
}

$output = $lines -join "`r`n"
Set-Content -Path "D:\PROJEKAN\dcn-opshub-project-scaffold\project\scripts\docx_content.txt" -Value $output -Encoding UTF8
Write-Host "Extracted $($lines.Count) lines to docx_content.txt"
