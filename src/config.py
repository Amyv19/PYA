"""
Configuración del proyecto de medición de errores de detección de odio
"""
import os
from pathlib import Path

# Rutas
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = BASE_DIR / "results"
MODELS_DIR = BASE_DIR / "models"

# Crear directorios si no existen
for directory in [DATA_DIR, RESULTS_DIR, MODELS_DIR]:
    directory.mkdir(exist_ok=True)

# Configuración del modelo
MODEL_NAME = "bert-base-multilingual-uncased"
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 2e-5
MAX_LENGTH = 128

# Clase labels
CLASS_LABELS = {
    0: "no_odio",
    1: "odio"
}

# Semilla para reproducibilidad
RANDOM_SEED = 42
