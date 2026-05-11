"""
Módulo de preprocesamiento de texto
"""
import re
import nltk
from typing import List
import pandas as pd

class TextPreprocessor:
    """Preprocesa texto para detección de hate speech"""
    
    def __init__(self):
        # Descargar recursos de nltk si es necesario
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
    
    def clean_text(self, text: str) -> str:
        """Limpia y normaliza texto"""
        # Convertir a minúsculas
        text = text.lower()
        
        # Remover URLs
        text = re.sub(r'http\S+|www.\S+', '', text)
        
        # Remover menciones y hashtags
        text = re.sub(r'@\w+|#\w+', '', text)
        
        # Remover caracteres especiales (mantener acentos)
        text = re.sub(r'[^a-záéíóúñ\s]', '', text)
        
        # Remover espacios múltiples
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def preprocess_dataframe(self, df: pd.DataFrame, text_column: str = 'text') -> pd.DataFrame:
        """Preprocesa columna de texto en dataframe"""
        df = df.copy()
        df[text_column] = df[text_column].apply(self.clean_text)
        return df
    
    def get_text_statistics(self, texts: List[str]) -> dict:
        """Calcula estadísticas del texto"""
        lengths = [len(text.split()) for text in texts]
        return {
            'avg_length': sum(lengths) / len(lengths),
            'max_length': max(lengths),
            'min_length': min(lengths),
            'total_texts': len(texts)
        }
