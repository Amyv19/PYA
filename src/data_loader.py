"""
Módulo para cargar y gestionar datos de hate speech
"""
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, List
from sklearn.model_selection import train_test_split

class DataLoader:
    """Carga y prepara datos para detección de hate speech"""
    
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
    
    def load_csv(self, filepath: str) -> pd.DataFrame:
        """Carga datos desde archivo CSV"""
        path = self.data_dir / filepath
        return pd.read_csv(path)
    
    def create_sample_dataset(self, filename: str = "sample_data.csv", n_samples: int = 1000):
        """Crea dataset de ejemplo para demostración"""
        np.random.seed(42)
        
        hate_texts = [
            "Eres un idiota y no mereces vivir",
            "Deberían deportarte del país",
            "Tu gente es la culpable de todo",
            "Eres una basura humana",
            "Los tuyos son todos criminales",
            "No mereces derechos",
            "Debería haber genocidio contra ustedes",
            "Eres un parásito para la sociedad",
            "Tu raza es inferior",
            "Maldita sea tu religión"
        ]
        
        non_hate_texts = [
            "Hola, ¿cómo estás?",
            "Tengo una pregunta sobre el proyecto",
            "Me gustaría discutir la política",
            "Creo que deberíamos mejorar la educación",
            "¿Qué opinas sobre el clima?",
            "Me encanta este libro",
            "Vamos al cine el viernes",
            "¿Cuál es tu película favorita?",
            "Tengo una buena idea para el trabajo",
            "El cielo está muy bonito hoy"
        ]
        
        texts = []
        labels = []
        
        for _ in range(n_samples // 2):
            texts.append(np.random.choice(hate_texts))
            labels.append(1)
            texts.append(np.random.choice(non_hate_texts))
            labels.append(0)
        
        df = pd.DataFrame({
            'text': texts,
            'label': labels
        })
        
        # Guardar
        output_path = self.data_dir / filename
        df.to_csv(output_path, index=False)
        print(f"Dataset de ejemplo creado: {output_path}")
        
        return df
    
    def split_data(self, df: pd.DataFrame, 
                   test_size: float = 0.2, 
                   val_size: float = 0.1,
                   random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Divide datos en train, validación y test"""
        
        # Separar test
        train_val, test = train_test_split(
            df, 
            test_size=test_size,
            random_state=random_state,
            stratify=df['label']
        )
        
        # Separar validación del train
        val_ratio = val_size / (1 - test_size)
        train, val = train_test_split(
            train_val,
            test_size=val_ratio,
            random_state=random_state,
            stratify=train_val['label']
        )
        
        print(f"Train: {len(train)}, Val: {len(val)}, Test: {len(test)}")
        
        return train, val, test
    
    def get_class_distribution(self, df: pd.DataFrame) -> dict:
        """Obtiene distribución de clases"""
        return df['label'].value_counts().to_dict()
