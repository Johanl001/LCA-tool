# Life Cycle Assessment (LCA) Platform

A comprehensive full-stack web application for Life Cycle Assessment with AI-powered insights, built for hackathons and production use.

## 🚀 Features

### Core Functionality
- **Complete Authentication System** - JWT-based with password hashing
- **Process Data Submission** - Stage-wise and overall LCA data input
- **AI-Powered Insights** - Static placeholders ready for OpenAI API integration
- **Scenario Simulation** - Real-time sustainability impact predictions
- **Project Comparison** - Multi-project analysis with visualizations
- **Comprehensive Reports** - PDF and Excel export with linear vs circular analysis
- **Machine Learning Integration** - Python-based training and prediction

### Technical Stack
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB
- **ML**: Python scripts with scikit-learn
- **Charts**: Chart.js with React integration
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM

## 🛠 Quick Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or cloud)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository>
cd lca-platform
npm install
```

2. **Setup environment variables**
```bash
cp .env.example server/.env
# Edit server/.env with your configuration
```

3. **Setup ML models (optional)**
```bash
# Place your dataset in /datasets folder (CSV/Excel format)
python ml_models/train_model.py
```

4. **Start the application**
```bash
npm run dev
```

The application will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📊 ML Training

### Quick ML Setup
1. Place your LCA dataset in the `/datasets` folder
2. Run the training script: `python train_model.py`
3. The system automatically generates sample data if no datasets are found

### Dataset Format
Your CSV/Excel should include:
- `metal_type`: Aluminum, Copper, Steel, etc.
- `production_route`: Primary/Secondary
- `total_energy`: Energy consumption (GJ)
- `total_water`: Water usage (m³)
- `recycling_rate`: Recycling percentage
- `sustainability_score`: Target score (0-100)

## 🎯 Key Features

### 1. Dashboard
- Project overview with statistics
- Interactive charts and visualizations
- Quick action buttons
- Real-time sustainability metrics

### 2. Process Data Submission
- Stage-wise input forms with validation
- Material type and transport mode selection
- Energy, water, and waste tracking
- Automatic total calculations

### 3. Scenario Simulation
- Real-time parameter adjustment with sliders
- Energy source optimization
- Transport mode comparison
- Recycling rate impact analysis

### 4. AI Insights
- Stage-wise performance analysis
- Circular vs linear economy recommendations
- Energy and water optimization suggestions
- Priority improvement recommendations

### 5. Reports & Exports
- Comprehensive PDF reports
- Excel data export with multiple sheets
- Linear vs circular economy comparison
- Visual charts and AI insights

### 6. Project Comparison
- Multi-project side-by-side analysis
- Performance ranking and benchmarking
- Resource usage comparison
- Best practice identification

## 🔐 Authentication

### Demo Account
- **Email**: demo@lca.com
- **Password**: demo123

### User Registration
- Full name and email required
- Password hashing with bcrypt
- JWT token-based sessions
- Role-based access control

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Accessible design patterns

## 🎨 Design System

- **Primary**: Green (#10B981) - Sustainability focus
- **Secondary**: Blue (#3B82F6) - Reliability
- **Accent**: Orange (#F97316) - Energy/Action
- **Typography**: Clean, scientific aesthetic
- **Components**: Card-based layouts with subtle shadows

## 🚀 Production Deployment

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://your-mongo-url
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

### Build Process
```bash
npm run build
```

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `POST /api/process/submit` - Submit LCA data
- `GET /api/process/all` - Get user projects
- `GET /api/process/get/:id` - Get single project
- `POST /api/process/compare` - Compare projects

### Simulation
- `POST /api/simulation/run` - Run scenario simulation
- `GET /api/simulation/history/:id` - Simulation history

### Reports
- `GET /api/report/generate/:id` - Generate report data

## 🔧 Customization

### Adding New Stages
Edit `src/components/SubmitProcess.tsx`:
```javascript
const commonStages = [
  'Mining', 'Processing', 'Smelting', 
  'Your-New-Stage' // Add here
];
```

### Custom ML Models
Replace the training logic in `ml_models/train_model.py` with your algorithms.

### UI Themes
Modify `tailwind.config.js` for custom color schemes.

## 📈 Performance

- Lazy loading for large datasets
- Optimized charts with Chart.js
- Efficient MongoDB queries
- Client-side caching for better UX

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check if MongoDB is running
- Verify connection string in `.env`

**ML Training Errors**
- Ensure Python dependencies: `pip install pandas numpy scikit-learn`
- Check dataset format and column names

**Frontend Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for missing dependencies

## 📄 License

MIT License - feel free to use for hackathons and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🎉 Hackathon Ready

This project is specifically designed for hackathons:
- ✅ Complete authentication system
- ✅ Full CRUD operations
- ✅ ML integration with training
- ✅ Professional UI/UX
- ✅ Export functionality
- ✅ Real-time simulations
- ✅ Comprehensive documentation
- ✅ Easy setup and deployment

Perfect for sustainability, environment, or technology challenges!
