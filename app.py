"""
Frontend con Streamlit para probar el detector de odio.
"""
from pathlib import Path
import sys

import pandas as pd
import streamlit as st

sys.path.insert(0, str(Path(__file__).parent / "src"))

from config import DATA_DIR
from data_loader import DataLoader
from predictor import HateSpeechPredictor
from preprocessor import TextPreprocessor


st.set_page_config(
    page_title="Detector de Odio",
    page_icon="O",
    layout="wide",
)


@st.cache_resource
def build_predictor():
    """Entrena el modelo base una vez por sesión."""
    loader = DataLoader(DATA_DIR)
    df = loader.create_sample_dataset(n_samples=1000)
    preprocessor = TextPreprocessor()
    df = preprocessor.preprocess_dataframe(df, "text")

    predictor = HateSpeechPredictor()
    predictor.fit(df["text"].tolist(), df["label"].tolist())
    return predictor, preprocessor


predictor, preprocessor = build_predictor()

st.markdown(
    """
    <style>
    .stApp {
        background:
            radial-gradient(circle at top left, rgba(255, 196, 84, 0.30), transparent 28%),
            radial-gradient(circle at top right, rgba(11, 93, 130, 0.22), transparent 25%),
            linear-gradient(135deg, #f6efe4 0%, #e3edf0 100%);
    }
    .hero {
        padding: 1.4rem 1.6rem;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(11, 93, 130, 0.10);
        box-shadow: 0 18px 45px rgba(26, 43, 60, 0.08);
        margin-bottom: 1rem;
    }
    .metric-card {
        padding: 1rem 1.2rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid rgba(11, 93, 130, 0.08);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="hero">
        <h1 style="margin-bottom:0.2rem;">Panel de Detección de Odio</h1>
        <p style="margin:0;color:#334e68;">
            Prueba texto manualmente o revisa tweets descargados desde X/Twitter.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

left_col, right_col = st.columns([1.2, 0.8], gap="large")

with left_col:
    st.subheader("Analizar texto")
    raw_text = st.text_area(
        "Escribe un texto para clasificar",
        height=180,
        placeholder="Ejemplo: Tu mensaje aquí...",
    )

    if st.button("Clasificar texto", use_container_width=True):
        if not raw_text.strip():
            st.warning("Escribe un texto antes de clasificar.")
        else:
            clean_text = preprocessor.clean_text(raw_text)
            result = predictor.predict_one(clean_text)
            tag = "Contenido de odio" if result["prediction"] == 1 else "Sin odio"
            color = "#9b2226" if result["prediction"] == 1 else "#2a6f4f"

            st.markdown(
                f"""
                <div class="metric-card">
                    <h3 style="margin:0;color:{color};">{tag}</h3>
                    <p style="margin:0.4rem 0 0 0;">Confianza: {result["confidence"]:.2%}</p>
                    <p style="margin:0.4rem 0 0 0;">Texto limpio: {clean_text}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

            prob_df = pd.DataFrame(
                {
                    "Etiqueta": list(result["probabilities"].keys()),
                    "Probabilidad": list(result["probabilities"].values()),
                }
            )
            st.bar_chart(prob_df.set_index("Etiqueta"))

with right_col:
    st.subheader("Tweets descargados")
    twitter_path = DATA_DIR / "twitter_posts.csv"

    if twitter_path.exists():
        tweets_df = pd.read_csv(twitter_path)
        preview_df = tweets_df.copy()
        if "clean_text" not in preview_df.columns and "text" in preview_df.columns:
            preview_df["clean_text"] = preview_df["text"].astype(str).apply(preprocessor.clean_text)

        preview_df["prediccion"] = preview_df["clean_text"].apply(
            lambda text: predictor.predict_one(str(text))["label"]
        )
        st.dataframe(
            preview_df[["text", "clean_text", "prediccion"]].head(20),
            use_container_width=True,
        )
    else:
        st.info("Todavía no existe data/twitter_posts.csv. Ejecuta python fetch_twitter_data.py.")

st.caption("Frontend local con Streamlit usando un clasificador base entrenado en el dataset de ejemplo.")
