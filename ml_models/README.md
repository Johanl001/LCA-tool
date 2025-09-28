# LCA Machine Learning Models

This directory contains the machine learning components for the LCA application.

## Quick Start

1. **Place your dataset** in the `/datasets` folder (CSV or Excel format)
2. **Train the models**: `python train_model.py`
3. **Start the web application**: The backend will automatically use the trained models for predictions

## Files

- `train_model.py`: Main training script
- `predict.py`: Prediction script (used by Node.js backend)
- `trained/`: Directory for saved models (created after training)
- `datasets/`: Place your training datasets here

## Dataset Format

Your dataset should include columns like:
- `metal_type`: Type of metal (Aluminum, Copper, Steel, etc.)
- `production_route`: Primary or Secondary
- `region`: Geographic region
- `total_energy`: Total energy consumption (GJ)
- `total_water`: Total water usage (m³)
- `recycling_rate`: Recycling percentage
- `sustainability_score`: Target variable (0-100)

## Training Process

The training script will:
1. Load all datasets from the `/datasets` folder
2. Preprocess and clean the data
3. Train multiple ML models (Random Forest, Gradient Boosting)
4. Select the best performing model for each target
5. Save models and metadata for prediction

## Model Outputs

The trained models predict:
- **Sustainability Score**: Overall environmental impact score
- **Circular Score**: Score considering circular economy principles
- **Linear Score**: Traditional linear economy score

## Integration

The Node.js backend automatically calls the Python prediction script when needed. No additional setup required after training.