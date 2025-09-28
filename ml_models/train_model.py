#!/usr/bin/env python3
"""
LCA Sustainability Prediction Model Training Script
Place your dataset in the /datasets folder and run this script
"""

import pandas as pd
import numpy as np
import os
import json
import pickle
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

class LCAModelTrainer:
    def __init__(self, dataset_path="datasets"):
        self.dataset_path = dataset_path
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_names = []
        self.model_metadata = {}
        
    def load_datasets(self):
        """Load all CSV/Excel files from the datasets folder"""
        datasets = []
        dataset_files = []
        
        if not os.path.exists(self.dataset_path):
            print(f"Creating {self.dataset_path} directory...")
            os.makedirs(self.dataset_path)
            print("Please place your dataset files (.csv or .xlsx) in the datasets folder and run again.")
            return None, None
            
        files = [f for f in os.listdir(self.dataset_path) 
                if f.endswith(('.csv', '.xlsx', '.xls'))]
        
        if not files:
            print("No dataset files found. Creating sample dataset...")
            self.create_sample_dataset()
            files = ['sample_lca_data.csv']
        
        for file in files:
            file_path = os.path.join(self.dataset_path, file)
            try:
                if file.endswith('.csv'):
                    df = pd.read_csv(file_path)
                else:
                    df = pd.read_excel(file_path)
                
                datasets.append(df)
                dataset_files.append(file)
                print(f"Loaded {file}: {len(df)} records")
                
            except Exception as e:
                print(f"Error loading {file}: {str(e)}")
        
        if not datasets:
            return None, None
            
        # Combine all datasets
        combined_df = pd.concat(datasets, ignore_index=True)
        print(f"Combined dataset: {len(combined_df)} total records")
        
        return combined_df, dataset_files
    
    def create_sample_dataset(self):
        """Create a sample dataset for demonstration"""
        np.random.seed(42)
        n_samples = 500
        
        # Generate synthetic LCA data
        data = {
            'project_name': [f'Project_{i}' for i in range(n_samples)],
            'metal_type': np.random.choice(['Aluminum', 'Copper', 'Steel', 'Titanium'], n_samples),
            'production_route': np.random.choice(['Primary', 'Secondary'], n_samples),
            'region': np.random.choice(['North America', 'Europe', 'Asia', 'South America'], n_samples),
            'total_energy': np.random.normal(150, 50, n_samples),
            'total_water': np.random.normal(80, 25, n_samples),
            'total_waste': np.random.normal(20, 8, n_samples),
            'transport_distance': np.random.normal(500, 200, n_samples),
            'recycling_rate': np.random.uniform(0, 80, n_samples),
            'reuse_rate': np.random.uniform(0, 30, n_samples),
            'product_lifetime': np.random.normal(15, 5, n_samples),
            'process_efficiency': np.random.uniform(60, 95, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Calculate sustainability score based on features
        df['sustainability_score'] = (
            100 - (df['total_energy'] * 0.2) - (df['total_water'] * 0.15) - 
            (df['total_waste'] * 0.3) + (df['recycling_rate'] * 0.3) + 
            (df['reuse_rate'] * 0.2) + (df['process_efficiency'] * 0.1) - 
            (df['transport_distance'] * 0.01)
        ).clip(0, 100)
        
        # Add some noise
        df['sustainability_score'] += np.random.normal(0, 5, n_samples)
        df['sustainability_score'] = df['sustainability_score'].clip(0, 100)
        
        # Calculate circular and linear scores
        df['circular_score'] = df['sustainability_score'] + (df['recycling_rate'] * 0.2) + (df['reuse_rate'] * 0.3)
        df['linear_score'] = df['sustainability_score'] - (df['recycling_rate'] * 0.1) - (df['reuse_rate'] * 0.15)
        
        df['circular_score'] = df['circular_score'].clip(0, 100)
        df['linear_score'] = df['linear_score'].clip(0, 100)
        
        # Save sample dataset
        sample_path = os.path.join(self.dataset_path, 'sample_lca_data.csv')
        df.to_csv(sample_path, index=False)
        print(f"Created sample dataset: {sample_path}")
        
    def preprocess_data(self, df):
        """Preprocess the dataset for training"""
        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        categorical_columns = df.select_dtypes(include=['object']).columns
        
        # Fill numeric missing values with median
        for col in numeric_columns:
            df[col].fillna(df[col].median(), inplace=True)
        
        # Fill categorical missing values with mode
        for col in categorical_columns:
            df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown', inplace=True)
        
        # Encode categorical variables
        for col in categorical_columns:
            if col not in ['project_name']:  # Skip ID columns
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                self.encoders[col] = le
        
        return df
    
    def train_models(self, df):
        """Train models for all numeric target columns dynamically"""
        # Define columns to exclude from features
        exclude_cols = ['project_name']
        
        # All numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Consider all numeric columns as potential targets
        targets = [col for col in numeric_cols if col not in exclude_cols]
        
        # Features are all numeric columns except the current target
        for target in targets:
            feature_cols = [col for col in numeric_cols if col != target]
            self.feature_names = feature_cols
            
            X = df[feature_cols]
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            self.scalers[target] = scaler
            
            y = df[target]
            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y, test_size=0.2, random_state=42
            )
            
            # Train Random Forest
            rf_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            rf_model.fit(X_train, y_train)
            
            # Train Gradient Boosting
            gb_model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
            gb_model.fit(X_train, y_train)
            
            # Evaluate models
            rf_pred = rf_model.predict(X_test)
            gb_pred = gb_model.predict(X_test)
            
            rf_r2 = r2_score(y_test, rf_pred)
            gb_r2 = r2_score(y_test, gb_pred)
            
            rf_mae = mean_absolute_error(y_test, rf_pred)
            gb_mae = mean_absolute_error(y_test, gb_pred)
            
            # Choose best model
            if rf_r2 > gb_r2:
                best_model = rf_model
                best_score = rf_r2
                best_mae = rf_mae
                model_type = 'RandomForest'
            else:
                best_model = gb_model
                best_score = gb_r2
                best_mae = gb_mae
                model_type = 'GradientBoosting'
            
            self.models[target] = best_model
            
            # Store metadata
            self.model_metadata[target] = {
                'model_type': model_type,
                'r2_score': best_score,
                'mae': best_mae,
                'features': feature_cols,
                'training_samples': len(X_train),
                'test_samples': len(X_test)
            }
            
            print(f"{target} - Best Model: {model_type}, R²: {best_score:.4f}, MAE: {best_mae:.2f}")

    
    def save_models(self):
        """Save trained models and metadata"""
        model_dir = "ml_models/trained"
        os.makedirs(model_dir, exist_ok=True)
        
        # Save models
        for target, model in self.models.items():
            model_path = os.path.join(model_dir, f"{target}_model.pkl")
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            print(f"Saved model for {target}: {model_path}")
        
        # Save scalers
        scaler_path = os.path.join(model_dir, "scalers.pkl")
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scalers, f)
        
        # Save encoders
        encoder_path = os.path.join(model_dir, "encoders.pkl")
        with open(encoder_path, 'wb') as f:
            pickle.dump(self.encoders, f)
        
        # Save metadata
        metadata = {
            'feature_names': self.feature_names,
            'models': self.model_metadata,
            'trained_at': datetime.now().isoformat(),
            'version': '1.0'
        }
        
        metadata_path = os.path.join(model_dir, "metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model training completed! Models saved in {model_dir}")
        return metadata
    
    def run_training(self):
        """Run the complete training pipeline"""
        print("Starting LCA Model Training Pipeline...")
        print("=" * 50)
        
        # Load datasets
        df, files = self.load_datasets()
        if df is None:
            return False
        
        print(f"Dataset shape: {df.shape}")
        print(f"Dataset columns: {list(df.columns)}")
        
        # Preprocess data
        print("\nPreprocessing data...")
        df_processed = self.preprocess_data(df)
        
        # Train models
        print("\nTraining models...")
        self.train_models(df_processed)
        
        # Save models
        print("\nSaving models...")
        metadata = self.save_models()
        
        print("\n" + "=" * 50)
        print("Training completed successfully!")
        print("\nModel Performance Summary:")
        for target, meta in self.model_metadata.items():
            print(f"{target}: {meta['model_type']} (R² = {meta['r2_score']:.4f})")
        
        return True

if __name__ == "__main__":
    trainer = LCAModelTrainer()
    success = trainer.run_training()
    
    if success:
        print("\n✅ Models are ready for prediction!")
        print("You can now use the web application for LCA predictions.")
    else:
        print("\n❌ Training failed. Please check the datasets and try again.")