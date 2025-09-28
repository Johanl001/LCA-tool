#!/usr/bin/env python3
"""
LCA Prediction Script for Node.js Integration
"""

import sys
import json
import pickle
import numpy as np
import pandas as pd
import os
from datetime import datetime

class LCAPredictor:
    def __init__(self, model_dir="ml_models/trained"):
        self.model_dir = model_dir
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.metadata = {}
        self.load_models()
    
    def load_models(self):
        """Load trained models and preprocessors"""
        try:
            # Load metadata
            metadata_path = os.path.join(self.model_dir, "metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
            
            # Load models
            targets = ['sustainability_score', 'circular_score', 'linear_score']
            for target in targets:
                model_path = os.path.join(self.model_dir, f"{target}_model.pkl")
                if os.path.exists(model_path):
                    with open(model_path, 'rb') as f:
                        self.models[target] = pickle.load(f)
            
            # Load scalers
            scaler_path = os.path.join(self.model_dir, "scalers.pkl")
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scalers = pickle.load(f)
            
            # Load encoders
            encoder_path = os.path.join(self.model_dir, "encoders.pkl")
            if os.path.exists(encoder_path):
                with open(encoder_path, 'rb') as f:
                    self.encoders = pickle.load(f)
                    
        except Exception as e:
            print(f"Error loading models: {str(e)}")
    
    def preprocess_input(self, data):
        """Preprocess input data for prediction"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame([data])
            
            # Encode categorical variables
            categorical_mappings = {
                'metal_type': {'Aluminum': 0, 'Copper': 1, 'Steel': 2, 'Titanium': 3},
                'production_route': {'Primary': 0, 'Secondary': 1},
                'region': {'North America': 0, 'Europe': 1, 'Asia': 2, 'South America': 3}
            }
            
            for col, mapping in categorical_mappings.items():
                if col in df.columns:
                    df[f'{col}_encoded'] = df[col].map(mapping).fillna(0)
            
            # Ensure all required features are present
            required_features = self.metadata.get('feature_names', [])
            for feature in required_features:
                if feature not in df.columns:
                    # Set default values for missing features
                    if 'encoded' in feature:
                        df[feature] = 0
                    elif 'rate' in feature or 'efficiency' in feature:
                        df[feature] = 50  # Default percentage
                    elif 'distance' in feature:
                        df[feature] = 500  # Default distance
                    elif 'lifetime' in feature:
                        df[feature] = 15  # Default lifetime
                    else:
                        df[feature] = 0
            
            # Select and order features
            X = df[required_features]
            
            # Scale features
            if 'main' in self.scalers:
                X_scaled = self.scalers['main'].transform(X)
            else:
                X_scaled = X.values
            
            return X_scaled
            
        except Exception as e:
            print(f"Preprocessing error: {str(e)}")
            return None
    
    def predict(self, data):
        """Make predictions for all targets"""
        try:
            # Preprocess input
            X_processed = self.preprocess_input(data)
            if X_processed is None:
                return {"error": "Preprocessing failed"}
            
            predictions = {}
            
            # Make predictions for each target
            for target, model in self.models.items():
                try:
                    pred = model.predict(X_processed)[0]
                    predictions[target] = max(0, min(100, float(pred)))  # Clamp to 0-100
                except Exception as e:
                    predictions[target] = 50  # Default fallback
            
            # Calculate additional metrics
            if 'sustainability_score' in predictions:
                base_score = predictions['sustainability_score']
                
                # Estimate improvements
                improvements = {
                    'energy_efficiency': min(25, data.get('process_efficiency', 80) - 60),
                    'recycling_impact': min(30, data.get('recycling_rate', 0) * 0.4),
                    'transport_optimization': min(15, max(0, 1000 - data.get('transport_distance', 500)) / 100)
                }
                
                predictions['improvements'] = improvements
                predictions['potential_score'] = min(100, base_score + sum(improvements.values()) * 0.5)
            
            return {
                "predictions": predictions,
                "model_info": {
                    "version": self.metadata.get('version', '1.0'),
                    "trained_at": self.metadata.get('trained_at', 'Unknown'),
                    "prediction_time": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input data provided"}))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        
        # Create predictor and make predictions
        predictor = LCAPredictor()
        
        # Check if models are loaded
        if not predictor.models:
            result = {
                "error": "No trained models found. Please run train_model.py first.",
                "fallback_predictions": {
                    "sustainability_score": 65,
                    "circular_score": 70,
                    "linear_score": 60
                }
            }
        else:
            result = predictor.predict(input_data)
        
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))

if __name__ == "__main__":
    main()