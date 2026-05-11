# Medición de Errores en Detección de Odio en Redes Sociales

Proyecto para medir y analizar errores en sistemas de detección automática de contenido de odio en plataformas de redes sociales.

## Estructura del Proyecto

```
pyap/
├── data/                 # Datos del proyecto
├── src/                  # Código fuente
│   ├── config.py        # Configuración general
│   ├── data_loader.py   # Carga y preprocesamiento de datos
│   ├── preprocessor.py  # Limpieza y normalización de texto
│   ├── evaluator.py     # Evaluación y análisis de errores
│   ├── experiments.py   # Gestión de experimentos
│   └── __init__.py      # Package init
├── results/             # Resultados y reportes
├── notebooks/           # Jupyter notebooks
├── requirements.txt     # Dependencias
├── main.py             # Script principal
└── README.md           # Este archivo
```

## Instalación

### 1. Clonar o descargar el proyecto
```bash
cd pyap
```

### 2. Crear entorno virtual (recomendado)
```bash
python -m venv venv
venv\Scripts\activate  # En Windows
# o
source venv/bin/activate  # En Linux/Mac
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

## Uso

### Ejecutar análisis completo
```bash
python main.py
```

### Descargar publicaciones desde X/Twitter
1. Crea una app en el portal de desarrolladores de X y obtén tu Bearer Token.
2. Define la variable de entorno `X_BEARER_TOKEN`.
3. Ejecuta:

```bash
python fetch_twitter_data.py
```

Esto descarga posts recientes según tu consulta y guarda un CSV en `data/twitter_posts.csv`.

Esto:
1. Crea un dataset de ejemplo (si no existe)
2. Preprocesa el texto
3. Divide los datos en train/val/test
4. Entrena múltiples modelos
5. Genera reportes de evaluación y análisis de errores

### Módulos principales

#### DataLoader
Carga y prepara datos de hate speech:
```python
from src.data_loader import DataLoader

loader = DataLoader("data/")
df = loader.create_sample_dataset()
train, val, test = loader.split_data(df)
```

#### TextPreprocessor
Limpia y normaliza texto:
```python
from src.preprocessor import TextPreprocessor

preprocessor = TextPreprocessor()
clean_df = preprocessor.preprocess_dataframe(df)
```

#### ModelEvaluator
Evalúa modelos y analiza errores:
```python
from src.evaluator import ModelEvaluator

evaluator = ModelEvaluator()
metrics = evaluator.calculate_metrics(y_true, y_pred, y_proba)
evaluator.plot_confusion_matrix(y_true, y_pred)
evaluator.plot_roc_curve(y_true, y_proba)
```

#### ExperimentRunner
Ejecuta y compara experimentos:
```python
from src.experiments import ExperimentRunner

runner = ExperimentRunner()
result = runner.run_experiment(
    name="Mi Modelo",
    X_train=X_train, y_train=y_train,
    X_test=X_test, y_test=y_test,
    model_config={...}
)
```

## Tipos de Análisis

### 1. Métricas de Rendimiento
- **Accuracy**: Exactitud general del modelo
- **Precision**: Proporción de predicciones positivas correctas
- **Recall**: Proporción de casos positivos identificados
- **F1-Score**: Media armónica de precisión y recall
- **ROC-AUC**: Área bajo la curva ROC

### 2. Análisis de Errores
- **Falsos Positivos (FP)**: Textos sin odio clasificados como con odio
- **Falsos Negativos (FN)**: Textos con odio clasificados como sin odio
- **Verdaderos Positivos (TP)**: Identificaciones correctas de odio
- **Verdaderos Negativos (TN)**: Rechazo correcto de textos sin odio

### 3. Visualizaciones
- Matriz de confusión
- Curva ROC
- Comparación de métricas entre modelos
- Distribución de errores

## Resultados

Los resultados se guardan en la carpeta `results/`:
- `confusion_matrix.png` - Matriz de confusión
- `roc_curve.png` - Curva ROC
- `metrics_comparison.png` - Comparación de métricas
- `error_report.csv` - Detalle de cada error
- `experiments_comparison.csv` - Comparación de experimentos
- `experiments_log.json` - Registro completo de experimentos

## Dataset de Ejemplo

El proyecto genera automáticamente un dataset de ejemplo con:
- 1000 textos (500 con odio, 500 sin odio)
- Textos en español
- Etiquetas binarias: 0 (sin odio), 1 (con odio)

Para usar tu propio dataset, coloca un archivo CSV en `data/` con columnas:
- `text`: El texto a clasificar
- `label`: 0 o 1

## Modelos Soportados

1. **Logistic Regression**: Modelo lineal rápido y eficiente
2. **Random Forest**: Modelo de conjunto robusto
3. **Naive Bayes**: Modelo probabilístico

Cada modelo utiliza vectorización TF-IDF de texto.

## Configuración

Modifica `src/config.py` para ajustar:
- Modelo a usar
- Tamaño de batch
- Número de epochs
- Learning rate
- Longitud máxima de texto
- Semilla para reproducibilidad

## Próximos Pasos

- [ ] Integrar modelos de transformers (BERT)
- [ ] Análisis de sesgo del modelo
- [ ] Validación cruzada
- [ ] Análisis de importancia de características
- [ ] Detección de textos ambiguos
- [ ] Validación con anotadores humanos

## Autor

Tu Nombre

## Licencia

MIT
# PYA

## Frontend

Ejecuta la interfaz local con:

```bash
streamlit run app.py
```

El frontend permite escribir texto para clasificarlo y revisar tweets descargados desde `data/twitter_posts.csv`.

## GitHub Pages

Tambien hay una version estatica en `docs/` para publicar con GitHub Pages.

1. En GitHub entra a `Settings > Pages`.
2. En `Build and deployment`, elige `Deploy from a branch`.
3. Selecciona la rama `main` y la carpeta `/docs`.
4. Guarda los cambios y espera la publicacion.
