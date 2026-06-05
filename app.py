"""
Frontend con Streamlit para estimar riesgo de odio en texto.
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
    page_title="Radar de Discurso",
    page_icon="R",
    layout="wide",
)


@st.cache_resource
def build_predictor():
    """Entrena el modelo base una vez por sesion."""
    loader = DataLoader(DATA_DIR)
    df = loader.create_sample_dataset(n_samples=1400)
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
            radial-gradient(circle at 10% 15%, rgba(201, 78, 54, 0.18), transparent 24%),
            radial-gradient(circle at 85% 20%, rgba(25, 79, 92, 0.15), transparent 20%),
            linear-gradient(180deg, #f3ecdf 0%, #e4ddd1 36%, #d8e0e2 100%);
        color: #162126;
    }
    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    .hero {
        padding: 1.6rem 1.7rem;
        border-radius: 30px;
        background: linear-gradient(135deg, rgba(251, 248, 242, 0.94), rgba(236, 228, 215, 0.82));
        border: 1px solid rgba(22, 33, 38, 0.08);
        box-shadow: 0 22px 55px rgba(28, 34, 39, 0.10);
        margin-bottom: 1rem;
    }
    .hero-kicker {
        margin: 0 0 0.4rem;
        font-size: 0.78rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #7a4b38;
        font-weight: 700;
    }
    .hero-title {
        margin: 0;
        font-size: 2.8rem;
        line-height: 0.95;
        max-width: 10ch;
    }
    .hero-copy {
        margin-top: 0.8rem;
        color: #43545b;
        max-width: 60ch;
        font-size: 1.02rem;
    }
    .panel {
        padding: 1rem 1.1rem;
        border-radius: 24px;
        background: rgba(255, 252, 247, 0.78);
        border: 1px solid rgba(22, 33, 38, 0.08);
        box-shadow: 0 14px 34px rgba(28, 34, 39, 0.06);
    }
    .result-card {
        padding: 1.15rem 1.2rem;
        border-radius: 22px;
        border: 1px solid rgba(22, 33, 38, 0.08);
        background: rgba(255, 252, 247, 0.92);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    .result-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
    }
    .result-metric {
        padding: 0.85rem 0.9rem;
        border-radius: 18px;
        background: rgba(22, 33, 38, 0.04);
    }
    .result-metric span {
        display: block;
        font-size: 0.78rem;
        color: #5f6d72;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    .result-metric strong {
        font-size: 1.2rem;
        color: #162126;
    }
    .soft-list {
        margin: 0.7rem 0 0;
        padding-left: 1.2rem;
        color: #4e5d63;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="hero">
        <p class="hero-kicker">PYA · revision contextual</p>
        <h1 class="hero-title">Radar de discurso y riesgo</h1>
        <p class="hero-copy">
            Esta version usa un enfoque hibrido: combina un clasificador TF-IDF
            con reglas de contexto para estimar riesgo de odio sin tratar cualquier insulto como una confirmacion automatica. La lectura sigue siendo orientativa y debe revisarse con criterio humano.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

left_col, right_col = st.columns([1.15, 0.85], gap="large")

with left_col:
    st.markdown('<div class="panel">', unsafe_allow_html=True)
    st.subheader("Analizar texto")
    raw_text = st.text_area(
        "Escribe un mensaje, comentario o tweet",
        height=200,
        placeholder="Ejemplo: Esa gente no merece derechos y deberian expulsarlos.",
    )

    if st.button("Evaluar texto", use_container_width=True):
        if not raw_text.strip():
            st.warning("Escribe un texto antes de estimar el riesgo.")
        else:
            clean_text = preprocessor.clean_text(raw_text)
            result = predictor.predict_one(clean_text)
            content_type = result["content_type"]
            is_hate = content_type == "odio"
            is_abusive = content_type == "agresion_verbal"
            tag = (
                "Probabilidad alta de odio" if is_hate
                else "Agresion verbal probable" if is_abusive
                else "Sin senales fuertes de odio"
            )
            color = "#8c2f39" if is_hate else "#9a6a18" if is_abusive else "#235847"
            matched_terms = ", ".join(result["matched_terms"]) if result["matched_terms"] else "sin coincidencias claras"
            reasons = ", ".join(result["reasons"]) if result["reasons"] else "solo evidencia del modelo"
            reading = (
                "La estimacion apunta a un ataque dirigido contra grupo o identidad."
                if is_hate else
                "Hay insulto directo, pero no aparecen senales suficientes de odio identitario."
                if is_abusive else
                "No hay senales claras de ataque dirigido ni de agresion fuerte."
            )

            st.markdown(
                f"""
                <div class="result-card">
                    <h3 style="margin:0;color:{color};">{tag}</h3>
                    <p style="margin:0.55rem 0 0;color:#4a5a60;">
                        {reading}
                    </p>
                    <div class="result-grid">
                        <div class="result-metric">
                            <span>Estimacion final</span>
                            <strong>{result["confidence"]:.1%}</strong>
                        </div>
                        <div class="result-metric">
                            <span>Probabilidad modelo</span>
                            <strong>{result["model_probability"]:.1%}</strong>
                        </div>
                        <div class="result-metric">
                            <span>Ajuste por reglas</span>
                            <strong>{result["rule_score"]:.1%}</strong>
                        </div>
                    </div>
                    <p style="margin:0.9rem 0 0;"><strong>Texto limpio:</strong> {clean_text}</p>
                    <p style="margin:0.4rem 0 0;"><strong>Terminos detectados:</strong> {matched_terms}</p>
                    <p style="margin:0.4rem 0 0;"><strong>Pistas usadas:</strong> {reasons}</p>
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
            st.bar_chart(prob_df.set_index("Etiqueta"), color=["#294c60"])
    else:
        st.markdown(
            """
            <ul class="soft-list">
                <li>Prioriza ataques dirigidos a grupos o identidades.</li>
                <li>Baja el peso de quejas comunes, critica politica o insultos no identitarios.</li>
                <li>Muestra una estimacion probabilistica separando modelo y reglas.</li>
            </ul>
            """,
            unsafe_allow_html=True,
        )
    st.markdown("</div>", unsafe_allow_html=True)

with right_col:
    st.markdown('<div class="panel">', unsafe_allow_html=True)
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
        preview_df["score_odio"] = preview_df["clean_text"].apply(
            lambda text: predictor.predict_one(str(text))["probabilities"]["odio"]
        )
        st.dataframe(
            preview_df[["text", "prediccion", "score_odio"]].head(20),
            use_container_width=True,
        )
    else:
        st.info("Todavia no existe data/twitter_posts.csv. Ejecuta python fetch_twitter_data.py.")
    st.markdown("</div>", unsafe_allow_html=True)

st.caption("Frontend local con Streamlit usando una arquitectura hibrida: clasificador TF-IDF mas reglas de contexto. Su lectura es orientativa, no definitiva.")
