@echo off
cd /d "%~dp0"
set XF_BASE_DIR=E:\MVRX\Financeiro\xFinance_3.0
call .venv\Scripts\activate.bat
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

