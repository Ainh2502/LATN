@echo off
echo ===============================
echo 🚀 BẮT ĐẦU TẠO MODULE CHO WEB-ADMIN (NestJS 10+)
echo ===============================

set NEST_CMD=npx nest

REM Danh sách module cần tạo
for %%M in (product category brand order customer promotion review banner dashboard) do (
    echo.
    echo 👉 Đang tạo module %%M ...
    %NEST_CMD% g resource %%M --no-spec
)

echo.
echo ===============================
echo ✅ TẠO MODULE HOÀN TẤT
echo ===============================
pause
