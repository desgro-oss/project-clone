# Локально, только для этого проекта: кнопка расширения opencode шлёт в терминал
# `opencode --port N`, а конфиг проекта — в форме v2. Запускаем opencode2 без --port.
# Подключается через PATH в .vscode/settings.json; .vscode/ исключён через .git/info/exclude.
$rest = @()
for ($i = 0; $i -lt $args.Count; $i++) {
  if ($args[$i] -eq '--port') { $i++; continue }
  if ("$($args[$i])" -like '--port=*') { continue }
  $rest += $args[$i]
}
& opencode2 @rest
exit $LASTEXITCODE
