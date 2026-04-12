# 批量替换 ElMessage 脚本
# 使用方法: PowerShell -ExecutionPolicy Bypass -File fix-elmessage.ps1

$files = @(
    "src/domains/casemgmt/views/CaseMgmtView.vue",
    "src/domains/casemgmt/views/CaseConfigView.vue",
    "src/domains/casemgmt/components/Assert/CompareGroupSettings.vue",
    "src/domains/casemgmt/components/Assert/JsonPathAssert.vue",
    "src/domains/casemgmt/components/common/RawContent.vue",
    "src/domains/casemgmt/components/preset/PresetTemplateDialog.vue",
    "src/domains/casemgmt/components/preset/PresetVariablesTable.vue",
    "src/domains/casemgmt/components/preset/PresetVarTableCore.vue",
    "src/domains/casemgmt/components/response/ResponseBodyView.vue",
    "src/domains/casemgmt/components/steps/ExtractVarStepDrawer.vue",
    "src/domains/casemgmt/components/steps/MysqlStepDrawer.vue",
    "src/domains/casemgmt/components/steps/RedisStepDrawer.vue",
    "src/domains/casemgmt/components/steps/ScriptStepDrawer.vue"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8

        # 检查是否包含 ElMessage
        if ($content -match "ElMessage") {
            Write-Host "处理文件: $file" -ForegroundColor Yellow

            # 替换导入语句
            $content = $content -replace "import\s*\{\s*ElMessage\s*\}\s*from\s*['"]element-plus['"]\s*\n?", "import { useMessage } from '@/shared/ui'`n"

            # 如果没有 useMessage 导入，添加它
            if (-not ($content -match "useMessage")) {
                $content = $content -replace "(import.*from.*\n)(.*<script setup>)", "`$1import { useMessage } from '@/shared/ui'`n`$2"
            }

            # 在 script setup 开始处添加 useMessage 调用
            if (-not ($content -match "const\s*\{\s*showSuccess")) {
                $content = $content -replace "(<script setup>.*\n)", "`$1const { showSuccess, showWarning, showError } = useMessage()`n"
            }

            # 替换 ElMessage.success
            $content = $content -replace "ElMessage\.success\(([^)]+)\)", "showSuccess(`$1)"

            # 替换 ElMessage.warning
            $content = $content -replace "ElMessage\.warning\(([^)]+)\)", "showWarning(`$1)"

            # 替换 ElMessage.error
            $content = $content -replace "ElMessage\.error\(([^)]+)\)", "showError(`$1)"

            # 替换 ElMessage.info
            $content = $content -replace "ElMessage\.info\(([^)]+)\)", "showInfo(`$1)"

            # 保存文件
            Set-Content $file $content -Encoding UTF8 -NoNewline
            Write-Host "  ✓ 已修复" -ForegroundColor Green
        }
    } else {
        Write-Host "文件不存在: $file" -ForegroundColor Red
    }
}

Write-Host "`n修复完成！请运行 'npm run build' 验证。" -ForegroundColor Cyan
