"""
Módulo para ejecutar experimentos de detección de hate speech
"""
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Tuple, List, Dict
import json
from datetime import datetime

class ExperimentRunner:
    """Ejecuta y registra experimentos"""
    
    def __init__(self, output_dir: Path = None):
        self.output_dir = output_dir or Path("results")
        self.output_dir.mkdir(exist_ok=True)
        self.experiments = []
    
    def run_experiment(self, name: str, X_train: np.ndarray, y_train: np.ndarray,
                       X_test: np.ndarray, y_test: np.ndarray,
                       model_config: dict) -> dict:
        """Ejecuta un experimento"""
        
        print(f"\n{'='*60}")
        print(f"Ejecutando experimento: {name}")
        print(f"{'='*60}")
        
        # Crear vectorizador
        vectorizer = TfidfVectorizer(**model_config.get('vectorizer_params', {}))
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        # Crear modelo
        model_type = model_config['model_type']
        if model_type == 'logistic_regression':
            model = LogisticRegression(**model_config.get('model_params', {}))
        elif model_type == 'random_forest':
            model = RandomForestClassifier(**model_config.get('model_params', {}))
        elif model_type == 'naive_bayes':
            model = MultinomialNB(**model_config.get('model_params', {}))
        else:
            raise ValueError(f"Modelo no soportado: {model_type}")
        
        # Entrenar
        print("Entrenando modelo...")
        model.fit(X_train_vec, y_train)
        
        # Predecir
        print("Realizando predicciones...")
        y_pred = model.predict(X_test_vec)
        y_proba = model.predict_proba(X_test_vec)
        
        # Calcular métricas
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
        
        experiment_result = {
            'name': name,
            'model_type': model_type,
            'timestamp': datetime.now().isoformat(),
            'metrics': {
                'accuracy': float(accuracy_score(y_test, y_pred)),
                'precision': float(precision_score(y_test, y_pred, average='weighted')),
                'recall': float(recall_score(y_test, y_pred, average='weighted')),
                'f1': float(f1_score(y_test, y_pred, average='weighted')),
                'roc_auc': float(roc_auc_score(y_test, y_proba[:, 1]))
            },
            'config': model_config,
            'predictions': y_pred.tolist() if hasattr(y_pred, 'tolist') else list(y_pred),
            'probabilities': y_proba.tolist() if hasattr(y_proba, 'tolist') else list(y_proba),
            'true_labels': y_test.tolist() if hasattr(y_test, 'tolist') else list(y_test)
        }
        
        self.experiments.append(experiment_result)
        
        # Imprimir resultados
        print("\nResultados:")
        for metric, value in experiment_result['metrics'].items():
            print(f"  {metric}: {value:.4f}")
        
        return experiment_result
    
    def save_experiment_log(self, filename: str = "experiments_log.json"):
        """Guarda registro de experimentos"""
        filepath = self.output_dir / filename
        with open(filepath, 'w') as f:
            json.dump(self.experiments, f, indent=2)
        print(f"\nRegistro de experimentos guardado: {filepath}")
    
    def compare_experiments(self) -> pd.DataFrame:
        """Compara resultados de experimentos"""
        comparison_data = []
        
        for exp in self.experiments:
            row = {
                'nombre': exp['name'],
                'modelo': exp['model_type'],
                'accuracy': exp['metrics']['accuracy'],
                'precision': exp['metrics']['precision'],
                'recall': exp['metrics']['recall'],
                'f1': exp['metrics']['f1'],
                'roc_auc': exp['metrics']['roc_auc']
            }
            comparison_data.append(row)
        
        df = pd.DataFrame(comparison_data)
        
        # Guardar
        filepath = self.output_dir / "experiments_comparison.csv"
        df.to_csv(filepath, index=False)
        print(f"Comparación de experimentos: {filepath}")
        
        return df
