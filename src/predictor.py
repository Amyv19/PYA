"""
Utilidades para entrenar un clasificador simple y realizar predicciones.
"""
from typing import Dict, List

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from config import CLASS_LABELS, RANDOM_SEED


class HateSpeechPredictor:
    """Entrena un pipeline simple en memoria para clasificar texto."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        self.model = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
        self.is_trained = False

    def fit(self, texts: List[str], labels: List[int]) -> None:
        """Entrena el modelo con textos y etiquetas."""
        X = self.vectorizer.fit_transform(texts)
        self.model.fit(X, labels)
        self.is_trained = True

    def predict_one(self, text: str) -> Dict:
        """Predice una sola pieza de texto."""
        if not self.is_trained:
            raise RuntimeError("El predictor aún no ha sido entrenado.")

        X = self.vectorizer.transform([text])
        pred = int(self.model.predict(X)[0])
        proba = self.model.predict_proba(X)[0]
        confidence = float(np.max(proba))

        return {
            "prediction": pred,
            "label": CLASS_LABELS[pred],
            "confidence": confidence,
            "probabilities": {
                CLASS_LABELS[0]: float(proba[0]),
                CLASS_LABELS[1]: float(proba[1]),
            },
        }
