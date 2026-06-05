# Cuantificación del Odio en Redes Sociales

Proyecto para estimar y analizar la probabilidad de contenido de odio en redes sociales. El sistema adopta un enfoque híbrido: combina un clasificador supervisado basado en TF-IDF con reglas léxicas y de contexto para apoyar la interpretación de casos sensibles. Su salida debe entenderse como una herramienta de apoyo y no como una decisión automática definitiva.

## Qué se entrega

Este repositorio contiene tres piezas:

1. `app.py`
   Interfaz funcional local con Streamlit.
2. `src/`
   Motor del análisis híbrido (`TF-IDF + regresión logística + reglas de contexto`).
3. `docs/`
   Maqueta pública para GitHub Pages.

## Qué mostrar en la entrega

1. Un ejemplo `neutral`.
2. Un ejemplo de `agresión verbal`.
3. Un ejemplo de `odio`.
4. La diferencia entre:
   - versión funcional local (`streamlit run app.py`)
   - demo pública (`docs/` en GitHub Pages)

## Instrucciones rápidas

### Ejecutar la versión funcional local

```bash
pip install -r requirements.txt
streamlit run app.py
```

### Abrir la demo pública localmente

```bash
cd docs
python -m http.server 8000
```

Luego abre:

- `http://localhost:8501` para la app local
- `http://localhost:8000` para la demo estática

## Qué decir si preguntan por GitHub Pages

- `GitHub Pages` solo muestra la maqueta o demo interactiva.
- La ejecución funcional real del sistema corre en local con Streamlit.
- La demo pública sirve para presentar interfaz, flujo y lógica general del análisis.

## Alcance

- Estima riesgo con una arquitectura híbrida de modelo supervisado más reglas de contexto.
- No determina de forma definitiva si un mensaje constituye odio.
- Debe usarse como apoyo para análisis, priorización y revisión.

## Enfoque Metodológico

La propuesta no depende exclusivamente de aprendizaje automático ni exclusivamente de reglas. La arquitectura combina:

- un componente estadístico basado en TF-IDF y clasificación supervisada, que aporta capacidad de generalización ante frases no vistas;
- un componente de reglas léxicas y de contexto, que ayuda a distinguir agresión verbal, exclusión y odio identitario en casos ambiguos o críticos.

Esta combinación mejora la interpretabilidad del sistema y mantiene coherencia con el objetivo del proyecto: cuantificar riesgo sin perder control contextual sobre mensajes sensibles.

En la implementación actual, la puntuación final mezcla ambos componentes con una ponderación fija de 70/30 entre modelo y reglas. Esa proporción funciona como decisión de diseño inicial y debe entenderse como un parámetro ajustable en futuras iteraciones.

## Limitación Actual

Aunque la arquitectura híbrida es defendible metodológicamente, el rendimiento real del componente de aprendizaje automático depende de la calidad y diversidad del corpus de entrenamiento. Si el conjunto de datos es demasiado sintético o poco variado, el modelo pierde capacidad de generalización y el peso práctico del sistema recae sobre las reglas heurísticas.

## Estructura del Proyecto

```text
pyap/
|- data/                 # Datos del proyecto
|- docs/                 # Version estatica para GitHub Pages
|- models/               # Modelos guardados
|- notebooks/            # Jupyter notebooks
|- results/              # Resultados y reportes
|- src/                  # Codigo fuente
|  |- config.py          # Configuracion general
|  |- data_loader.py     # Carga y preprocesamiento de datos
|  |- evaluator.py       # Evaluacion y analisis de errores
|  |- experiments.py     # Gestion de experimentos
|  |- predictor.py       # Prediccion y reglas de contexto
|  |- preprocessor.py    # Limpieza y normalizacion de texto
|- app.py                # Frontend con Streamlit
|- main.py               # Script principal
|- fetch_twitter_data.py # Descarga de publicaciones
`- README.md             # Este archivo
```

## Instalacion

```bash
cd pyap
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Uso

### Ejecutar analisis completo

```bash
python main.py
```

Esto:

1. Crea un dataset de ejemplo si no existe.
2. Preprocesa el texto.
3. Divide los datos en train, validacion y test.
4. Entrena multiples modelos.
5. Genera reportes de evaluacion y analisis de errores.

### Ejecutar la interfaz local

```bash
streamlit run app.py
```

La interfaz permite escribir texto para estimar su nivel de riesgo y revisar tweets descargados desde `data/twitter_posts.csv`.

### Descargar publicaciones desde X/Twitter

1. Crea una app en el portal de desarrolladores de X y obtén tu Bearer Token.
2. Define la variable de entorno `X_BEARER_TOKEN`.
3. Ejecuta:

```bash
python fetch_twitter_data.py
```

Esto descarga posts recientes segun tu consulta y guarda un CSV en `data/twitter_posts.csv`.

## Modulos principales

### DataLoader

Carga y prepara datos para cuantificar riesgo de odio:

```python
from src.data_loader import DataLoader

loader = DataLoader("data/")
df = loader.create_sample_dataset()
train, val, test = loader.split_data(df)
```

### TextPreprocessor

Limpia y normaliza texto:

```python
from src.preprocessor import TextPreprocessor

preprocessor = TextPreprocessor()
clean_df = preprocessor.preprocess_dataframe(df)
```

### ModelEvaluator

Evalua modelos y analiza errores:

```python
from src.evaluator import ModelEvaluator

evaluator = ModelEvaluator()
metrics = evaluator.calculate_metrics(y_true, y_pred, y_proba)
evaluator.plot_confusion_matrix(y_true, y_pred)
evaluator.plot_roc_curve(y_true, y_proba)
```

### ExperimentRunner

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

## Tipos de Analisis

### 1. Metricas de Rendimiento

- `accuracy`: exactitud general del modelo.
- `precision`: proporcion de predicciones positivas correctas.
- `recall`: proporcion de casos positivos identificados.
- `f1-score`: equilibrio entre precision y recall.
- `roc-auc`: area bajo la curva ROC.

### 2. Analisis de Errores

- `FP`: textos marcados con riesgo de odio cuando no deberian escalarse.
- `FN`: textos con riesgo de odio que el sistema no priorizo.
- `TP`: casos donde la estimacion coincide con contenido riesgoso.
- `TN`: casos donde el sistema descarta riesgo de odio correctamente.

### 3. Visualizaciones

- Matriz de confusion.
- Curva ROC.
- Comparacion de metricas entre modelos.
- Distribucion de errores.

## Resultados

Los resultados se guardan en `results/`:

- `confusion_matrix.png`
- `roc_curve.png`
- `metrics_comparison.png`
- `error_report.csv`
- `experiments_comparison.csv`
- `experiments_log.json`

## Dataset de Ejemplo

El proyecto genera automaticamente un dataset con:

- 1000 textos.
- 500 ejemplos con odio y 500 sin odio.
- Textos en espanol.
- Etiquetas binarias: `0` para sin odio y `1` para odio.

Para usar tu propio dataset, coloca un CSV en `data/` con columnas:

- `text`: texto a evaluar.
- `label`: `0` o `1`.

## Modelos Soportados

1. Logistic Regression.
2. Random Forest.
3. Naive Bayes.

Cada modelo utiliza vectorizacion TF-IDF.

## Configuracion

Puedes ajustar `src/config.py` para cambiar:

- Modelo a usar.
- Tamano de batch.
- Numero de epochs.
- Learning rate.
- Longitud maxima de texto.
- Semilla para reproducibilidad.

## Proximos Pasos

- [ ] Integrar modelos de transformers.
- [ ] Analisis de sesgo del modelo.
- [ ] Validacion cruzada.
- [ ] Analisis de importancia de caracteristicas.
- [ ] Cuantificacion mas fina de textos ambiguos.
- [ ] Validacion con anotadores humanos.

## GitHub Pages

Tambien hay una version estatica en `docs/` para publicar con GitHub Pages:

1. En GitHub entra a `Settings > Pages`.
2. En `Build and deployment`, elige `Deploy from a branch`.
3. Selecciona la rama `main` y la carpeta `/docs`.
4. Guarda los cambios y espera la publicacion.

## Licencia

MIT
