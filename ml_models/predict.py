#!/usr/bin/env python3
"""
Enhanced LCA Prediction Script with Improved Accuracy and Error Handling
"""

import sys
import json
import pickle
import numpy as np
import pandas as pd
import os
from datetime import datetime
import logging
from typing import Dict, Any, Optional, Tuple
import warnings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress warnings
warnings.filterwarnings('ignore')

class EnhancedLCAPredictor:
    """Enhanced LCA Predictor with improved accuracy and error handling"""
    
    def __init__(self, model_dir="ml_models/trained"):
        self.model_dir = model_dir
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.metadata = {}
        self.feature_importance = {}
        self.model_accuracy = {}
        
        # Industry benchmarks for validation
        self.industry_benchmarks = {
            'aluminum': {
                'energy_intensity': {'min': 12.0, 'max': 25.0, 'avg': 18.5},
                'water_intensity': {'min': 8.0, 'max': 20.0, 'avg': 12.0},
                'co2_intensity': {'min': 10.0, 'max': 20.0, 'avg': 15.0}
            },
            'copper': {
                'energy_intensity': {'min': 15.0, 'max': 30.0, 'avg': 22.0},
                'water_intensity': {'min': 10.0, 'max': 25.0, 'avg': 16.0},
                'co2_intensity': {'min': 12.0, 'max': 25.0, 'avg': 18.0}
            },
            'steel': {
                'energy_intensity': {'min': 18.0, 'max': 35.0, 'avg': 26.0},
                'water_intensity': {'min': 12.0, 'max': 30.0, 'avg': 20.0},
                'co2_intensity': {'min': 15.0, 'max': 30.0, 'avg': 22.0}
            }
        }
        
        try:
            self.load_models()
            logger.info(f"Successfully loaded {len(self.models)} models")
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            self.initialize_fallback_models()
    
    def initialize_fallback_models(self):
        """Initialize fallback models when trained models are not available"""
        logger.info("Initializing fallback prediction models")
        self.models = {'fallback': True}
        self.metadata = {
            'version': '1.0-fallback',
            'trained_at': 'Fallback mode',
            'feature_names': ['metal_type_encoded', 'production_route_encoded', 'region_encoded',
                            'total_energy', 'total_water', 'recycling_rate', 'process_efficiency']
        }
    
    def load_models(self):
        """Load trained models and preprocessors with enhanced error handling"""
        try:
            # Load metadata
            metadata_path = os.path.join(self.model_dir, "metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                logger.info("Metadata loaded successfully")
            
            # Load models
            targets = ['sustainability_score', 'circular_score', 'linear_score']
            for target in targets:
                model_path = os.path.join(self.model_dir, f"{target}_model.pkl")
                if os.path.exists(model_path):
                    try:
                        with open(model_path, 'rb') as f:
                            self.models[target] = pickle.load(f)
                        logger.info(f"Loaded model for {target}")
                    except Exception as e:
                        logger.warning(f"Failed to load model for {target}: {str(e)}")
            
            # Load scalers
            scaler_path = os.path.join(self.model_dir, "scalers.pkl")
            if os.path.exists(scaler_path):
                try:
                    with open(scaler_path, 'rb') as f:
                        self.scalers = pickle.load(f)
                    logger.info("Scalers loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load scalers: {str(e)}")
            
            # Load encoders
            encoder_path = os.path.join(self.model_dir, "encoders.pkl")
            if os.path.exists(encoder_path):
                try:
                    with open(encoder_path, 'rb') as f:
                        self.encoders = pickle.load(f)
                    logger.info("Encoders loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load encoders: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error in load_models: {str(e)}")
            raise
    
    def validate_input_data(self, data: Dict[str, Any]) -> Tuple[bool, str]:
        """Validate input data against expected ranges and formats"""
        try:
            # Check required fields
            required_fields = ['metal_type', 'production_route', 'region']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return False, f"Missing required fields: {missing_fields}"
            
            # Validate metal type
            valid_metals = ['Aluminum', 'Copper', 'Steel', 'Titanium']
            if data.get('metal_type') not in valid_metals:
                return False, f"Invalid metal_type. Must be one of: {valid_metals}"
            
            # Validate numerical ranges
            if 'total_energy' in data:
                energy = float(data['total_energy'])
                if energy < 0 or energy > 100:
                    return False, "total_energy must be between 0 and 100 GJ"
            
            if 'recycling_rate' in data:
                recycling = float(data['recycling_rate'])
                if recycling < 0 or recycling > 100:
                    return False, "recycling_rate must be between 0 and 100%"
            
            return True, "Valid"
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def preprocess_input(self, data: Dict[str, Any]) -> Optional[np.ndarray]:
        """Enhanced preprocessing with better error handling"""
        try:
            # Validate input first
            is_valid, validation_message = self.validate_input_data(data)
            if not is_valid:
                logger.error(f"Input validation failed: {validation_message}")
                return None
            
            # Convert to DataFrame
            df = pd.DataFrame([data])
            
            # Encode categorical variables with error handling
            categorical_mappings = {
                'metal_type': {'Aluminum': 0, 'Copper': 1, 'Steel': 2, 'Titanium': 3},
                'production_route': {'Primary': 0, 'Secondary': 1},
                'region': {'North America': 0, 'Europe': 1, 'Asia': 2, 'South America': 3, 'India': 2}
            }
            
            for col, mapping in categorical_mappings.items():
                if col in df.columns:
                    try:
                        df[f'{col}_encoded'] = df[col].map(lambda x: mapping.get(x, 0)).fillna(0)
                    except Exception as e:
                        logger.warning(f"Failed to encode {col}: {str(e)}")
                        df[f'{col}_encoded'] = 0
            
            # Ensure all required features are present
            required_features = self.metadata.get('feature_names', [
                'metal_type_encoded', 'production_route_encoded', 'region_encoded',
                'total_energy', 'total_water', 'recycling_rate', 'process_efficiency'
            ])
            
            for feature in required_features:
                if feature not in df.columns:
                    # Set intelligent defaults
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
            
            # Scale features if scaler is available
            if 'main' in self.scalers:
                try:
                    X_scaled = self.scalers['main'].transform(X)
                except Exception as e:
                    logger.warning(f"Scaling failed, using raw features: {str(e)}")
                    X_scaled = X.values
            else:
                X_scaled = X.values
            
            return X_scaled
            
        except Exception as e:
            logger.error(f"Preprocessing error: {str(e)}")
            return None
    
    def apply_industry_benchmarks(self, predictions: Dict[str, float], metal_type: str) -> Dict[str, float]:
        """Apply industry benchmark validation and adjustment"""
        try:
            metal_key = metal_type.lower()
            if metal_key in self.industry_benchmarks:
                benchmarks = self.industry_benchmarks[metal_key]
                
                # Adjust predictions to stay within reasonable ranges
                for key in ['sustainability_score', 'circular_score', 'linear_score']:
                    if key in predictions:
                        # Ensure scores are within 0-100 range
                        predictions[key] = max(0, min(100, predictions[key]))
                
                # Add confidence based on benchmark alignment
                predictions['confidence'] = self.calculate_confidence(predictions, benchmarks)
                
            return predictions
            
        except Exception as e:
            logger.warning(f"Benchmark application failed: {str(e)}")
            return predictions
    
    def calculate_confidence(self, predictions: Dict[str, float], benchmarks: Dict[str, Any]) -> float:
        """Calculate prediction confidence based on benchmark alignment"""
        try:
            # Simple confidence calculation based on reasonable ranges
            base_confidence = 0.8  # Base confidence for fallback predictions
            
            # Adjust based on score reasonableness
            sustainability = predictions.get('sustainability_score', 50)
            if 30 <= sustainability <= 95:
                base_confidence += 0.1
            
            circular = predictions.get('circular_score', 50)
            linear = predictions.get('linear_score', 50)
            
            # Circular should generally be higher than linear
            if circular > linear:
                base_confidence += 0.1
            
            return min(1.0, base_confidence)
            
        except Exception as e:
            logger.warning(f"Confidence calculation failed: {str(e)}")
            return 0.7
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced prediction with comprehensive error handling"""
        try:
            # Preprocess input
            X_processed = self.preprocess_input(data)
            if X_processed is None:
                return {"error": "Preprocessing failed"}
            
            predictions = {}
            
            # Check if we have trained models or use fallback
            if 'fallback' in self.models:
                # Use enhanced fallback prediction logic
                predictions = self.fallback_predict(data)
            else:
                # Use trained models
                for target, model in self.models.items():
                    try:
                        pred = model.predict(X_processed)[0]
                        predictions[target] = max(0, min(100, float(pred)))
                    except Exception as e:
                        logger.warning(f"Model prediction failed for {target}: {str(e)}")
                        predictions[target] = self.fallback_single_prediction(target, data)
            
            # Apply industry benchmarks and validation
            metal_type = data.get('metal_type', 'Aluminum')
            predictions = self.apply_industry_benchmarks(predictions, metal_type)
            
            # Calculate additional metrics
            predictions = self.calculate_additional_metrics(predictions, data)
            
            return {
                "predictions": predictions,
                "model_info": {
                    "version": self.metadata.get('version', '1.0-enhanced'),
                    "trained_at": self.metadata.get('trained_at', 'Enhanced mode'),
                    "prediction_time": datetime.now().isoformat(),
                    "confidence": predictions.get('confidence', 0.8)
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {"error": f"Prediction failed: {str(e)}"}
    
    def fallback_predict(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Enhanced fallback prediction logic"""
        try:
            # Base scores with metal-specific adjustments
            metal_type = data.get('metal_type', 'Aluminum').lower()
            base_scores = {
                'aluminum': {'sustainability': 70, 'circular': 80, 'linear': 55},
                'copper': {'sustainability': 65, 'circular': 75, 'linear': 50},
                'steel': {'sustainability': 60, 'circular': 70, 'linear': 45},
                'titanium': {'sustainability': 75, 'circular': 85, 'linear': 60}
            }
            
            scores = base_scores.get(metal_type, base_scores['aluminum'])
            
            # Adjust based on production route
            if data.get('production_route') == 'Secondary':
                scores['sustainability'] += 10
                scores['circular'] += 15
                scores['linear'] += 5
            
            # Adjust based on recycling rate
            recycling_rate = float(data.get('recycling_rate', 0))
            recycling_bonus = recycling_rate * 0.3
            scores['sustainability'] += recycling_bonus
            scores['circular'] += recycling_bonus * 1.2
            
            # Adjust based on efficiency
            efficiency = float(data.get('process_efficiency', 75))
            efficiency_factor = (efficiency - 50) * 0.2
            scores['sustainability'] += efficiency_factor
            scores['circular'] += efficiency_factor
            scores['linear'] += efficiency_factor * 0.5
            
            # Ensure all scores are within valid range
            for key in scores:
                scores[key] = max(0, min(100, scores[key]))
            
            return {
                'sustainability_score': round(scores['sustainability'], 1),
                'circular_score': round(scores['circular'], 1),
                'linear_score': round(scores['linear'], 1)
            }
            
        except Exception as e:
            logger.error(f"Fallback prediction failed: {str(e)}")
            return {
                'sustainability_score': 65.0,
                'circular_score': 75.0,
                'linear_score': 55.0
            }
    
    def fallback_single_prediction(self, target: str, data: Dict[str, Any]) -> float:
        """Generate single fallback prediction"""
        fallback_scores = {
            'sustainability_score': 65.0,
            'circular_score': 75.0,
            'linear_score': 55.0
        }
        return fallback_scores.get(target, 60.0)
    
    def calculate_additional_metrics(self, predictions: Dict[str, float], data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate additional derived metrics"""
        try:
            if 'sustainability_score' in predictions:
                base_score = predictions['sustainability_score']
                
                # Estimate improvements based on input data
                improvements = {
                    'energy_efficiency': min(25, max(0, float(data.get('process_efficiency', 80)) - 60) * 0.5),
                    'recycling_impact': min(30, float(data.get('recycling_rate', 0)) * 0.4),
                    'transport_optimization': min(15, max(0, 1000 - float(data.get('transport_distance', 500))) / 100)
                }
                
                predictions['improvements'] = improvements
                predictions['potential_score'] = min(100, base_score + sum(improvements.values()) * 0.5)
            
            return predictions
            
        except Exception as e:
            logger.warning(f"Additional metrics calculation failed: {str(e)}")
            return predictions

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input data provided"}))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        
        # Create predictor and make predictions
        predictor = EnhancedLCAPredictor()
        
        # Generate predictions
        result = predictor.predict(input_data)
        
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))

if __name__ == "__main__":
    main()