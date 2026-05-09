#!/bin/bash
# VIGÍA API — Script de arranque
# Corre en el VM: bash ~/GobIA/backend/start.sh

set -e
cd "$(dirname "$0")"

echo "▸ Activando entorno virtual..."
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo "  Entorno creado."
fi
source .venv/bin/activate

echo "▸ Instalando dependencias..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo "▸ Levantando FastAPI en puerto 8000..."
echo "  API disponible en http://localhost:8000"
echo "  Docs: http://localhost:8000/docs"
echo ""

# Usar nohup para que siga corriendo al cerrar SSH
nohup uvicorn app:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --log-level info \
  >> /tmp/vigia-api.log 2>&1 &

echo "  PID: $!"
echo "  Logs: tail -f /tmp/vigia-api.log"
echo ""
echo "✅ API corriendo en background"
