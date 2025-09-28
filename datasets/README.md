# Datasets Directory

Place your LCA training datasets here in CSV or Excel format.

## Required Columns

Your dataset should include these columns for optimal model training:

### Mandatory Fields
- `project_name`: Project identifier
- `metal_type`: Type of metal (e.g., Aluminum, Copper, Steel, Titanium)
- `production_route`: Primary or Secondary production
- `region`: Geographic region
- `total_energy`: Total energy consumption (GJ)
- `total_water`: Total water usage (m³)
- `sustainability_score`: Target sustainability score (0-100)

### Optional Fields (for better predictions)
- `total_waste`: Waste generated (kg)
- `transport_distance`: Transportation distance (km)
- `recycling_rate`: Recycling percentage (0-100)
- `reuse_rate`: Reuse percentage (0-100)
- `product_lifetime`: Product lifespan (years)
- `process_efficiency`: Process efficiency percentage
- `circular_score`: Circular economy score (0-100)
- `linear_score`: Linear economy score (0-100)

## Sample Data

If no datasets are found, the training script will automatically generate sample data for demonstration purposes.

## Supported Formats
- CSV files (*.csv)
- Excel files (*.xlsx, *.xls)

## Usage

1. Add your dataset files to this directory
2. Run `python train_model.py` from the project root
3. The training script will automatically detect and use all datasets