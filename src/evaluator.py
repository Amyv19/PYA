"""
Módulo para evaluación de modelos y análisis de errores
"""
import numpy as np
import pandas as pd
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    roc_curve,
    precision_recall_curve
)
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

class ModelEvaluator:
    """Evalúa rendimiento de modelos de detección de hate speech"""
    
    def __init__(self, output_dir: Path = None):
        self.output_dir = output_dir or Path("results")
        self.output_dir.mkdir(exist_ok=True)
    
    def calculate_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, 
                         y_proba: np.ndarray = None) -> dict:
        """Calcula métricas de evaluación"""
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted'),
            'recall': recall_score(y_true, y_pred, average='weighted'),
            'f1': f1_score(y_true, y_pred, average='weighted'),
        }
        
        if y_proba is not None:
            metrics['roc_auc'] = roc_auc_score(y_true, y_proba[:, 1])
        
        return metrics
    
    def get_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray) -> np.ndarray:
        """Obtiene matriz de confusión"""
        return confusion_matrix(y_true, y_pred)
    
    def get_detailed_report(self, y_true: np.ndarray, y_pred: np.ndarray) -> str:
        """Obtiene reporte detallado de clasificación"""
        return classification_report(y_true, y_pred, 
                                     target_names=['No Odio', 'Odio'])
    
    def analyze_errors(self, y_true: np.ndarray, y_pred: np.ndarray, 
                       texts: np.ndarray = None) -> dict:
        """Analiza errores de predicción"""
        errors = {
            'false_positives': [],
            'false_negatives': [],
            'true_positives': [],
            'true_negatives': []
        }
        
        for i, (true, pred) in enumerate(zip(y_true, y_pred)):
            text = texts[i] if texts is not None else f"Sample {i}"
            
            if true == 0 and pred == 1:
                errors['false_positives'].append({
                    'index': i,
                    'text': text,
                    'true_label': true,
                    'pred_label': pred
                })
            elif true == 1 and pred == 0:
                errors['false_negatives'].append({
                    'index': i,
                    'text': text,
                    'true_label': true,
                    'pred_label': pred
                })
            elif true == 1 and pred == 1:
                errors['true_positives'].append({
                    'index': i,
                    'text': text,
                    'true_label': true,
                    'pred_label': pred
                })
            else:
                errors['true_negatives'].append({
                    'index': i,
                    'text': text,
                    'true_label': true,
                    'pred_label': pred
                })
        
        return errors
    
    def plot_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray, 
                             filename: str = "confusion_matrix.png"):
        """Grafica matriz de confusión"""
        cm = self.get_confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                    xticklabels=['No Odio', 'Odio'],
                    yticklabels=['No Odio', 'Odio'])
        plt.title('Matriz de Confusión')
        plt.ylabel('Etiqueta Real')
        plt.xlabel('Predicción')
        
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Matriz de confusión guardada: {filepath}")
    
    def plot_roc_curve(self, y_true: np.ndarray, y_proba: np.ndarray,
                      filename: str = "roc_curve.png"):
        """Grafica curva ROC"""
        fpr, tpr, _ = roc_curve(y_true, y_proba[:, 1])
        auc = roc_auc_score(y_true, y_proba[:, 1])
        
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, label=f'ROC (AUC = {auc:.3f})', linewidth=2)
        plt.plot([0, 1], [0, 1], 'k--', label='Random', linewidth=1)
        plt.xlabel('Tasa de Falsos Positivos')
        plt.ylabel('Tasa de Verdaderos Positivos')
        plt.title('Curva ROC')
        plt.legend()
        plt.grid(alpha=0.3)
        
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Curva ROC guardada: {filepath}")
    
    def plot_metrics_comparison(self, metrics_list: list, labels: list,
                               filename: str = "metrics_comparison.png"):
        """Compara métricas de múltiples modelos"""
        metrics_df = pd.DataFrame(metrics_list)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        metrics_df.set_index(pd.Index(labels)).plot(kind='bar', ax=ax)
        plt.title('Comparación de Métricas')
        plt.ylabel('Valor')
        plt.xlabel('Modelo')
        plt.legend(loc='best')
        plt.ylim([0, 1])
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Gráfica de métricas guardada: {filepath}")
    
    def generate_error_report(self, y_true: np.ndarray, y_pred: np.ndarray,
                             texts: np.ndarray = None) -> pd.DataFrame:
        """Genera reporte de errores en formato DataFrame"""
        errors = self.analyze_errors(y_true, y_pred, texts)
        
        report_data = []
        
        for error_type, error_list in errors.items():
            for error in error_list:
                report_data.append({
                    'error_type': error_type,
                    'index': error['index'],
                    'true_label': error['true_label'],
                    'pred_label': error['pred_label'],
                    'text_preview': error['text'][:50] if isinstance(error['text'], str) else str(error['text'])[:50]
                })
        
        return pd.DataFrame(report_data)
