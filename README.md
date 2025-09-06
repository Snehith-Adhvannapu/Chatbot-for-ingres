# INGRES AI Assistant

## India Ground Water Resource Estimation System

A modern AI-powered web application for querying and analyzing groundwater assessment data across India. Built with React, TypeScript, and powered by Google Gemini AI for natural language processing of groundwater queries.

![INGRES Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=INGRES+AI+Assistant)

## 🌟 Features

### 🤖 AI-Powered Chat Interface
- Natural language queries in English and Hindi
- Context-aware conversations with memory
- Real-time groundwater data analysis
- Interactive data visualization

### 🗺️ Comprehensive Data Coverage
- **Real 2024-2025 assessment data** for all major Indian states
- State-level groundwater statistics
- Extraction rates, recharge data, and categorization
- Historical trends and comparisons

### 🌐 Multi-Language Support
- **10 Indian Languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia
- Real-time translation powered by Google Gemini
- Language-specific speech recognition

### 📊 Data Visualization
- Interactive charts and graphs
- Downloadable CSV reports
- Region-wise comparison tools
- Historical trend analysis

### 🎨 Modern UI/UX
- Clean, responsive design with shadcn/ui components
- Dark/light theme support
- Mobile-optimized interface
- Accessible design principles

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ingres-ai-assistant.git
   cd ingres-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=your_postgresql_url_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** for data storage
- **Google Gemini AI** for natural language processing

### Key Components
```
client/
├── src/
│   ├── components/
│   │   ├── chat/           # Chat interface components
│   │   ├── charts/         # Data visualization
│   │   ├── data/           # Data display components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Application pages
│   ├── lib/                # Utilities and configurations
│   └── hooks/              # Custom React hooks

server/
├── services/
│   └── gemini.ts           # AI service integration
├── data/
│   └── assessment-2025.ts  # Real groundwater data
├── routes.ts               # API endpoints
└── storage.ts              # Database operations
```

## 📊 Data Sources

### Real Data (2024-2025)
- **Official CGWB Assessment Data**
- State-level groundwater statistics
- Extraction rates and recharge data
- Categorization (Safe, Semi-Critical, Critical, Over-Exploited)

### Supported States
Andaman and Nicobar Islands, Arunachal Pradesh, Assam, Bihar, Chandigarh, Chhattisgarh, Delhi, Gujarat, Haryana, Karnataka, Kerala, Maharashtra, Punjab, Rajasthan, Tamil Nadu, Telangana, West Bengal, and more.

## 🔧 Configuration

### Environment Variables
```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Database (Optional - uses in-memory storage by default)
DATABASE_URL=postgresql://user:password@localhost:5432/ingres

# Development
NODE_ENV=development
```

### API Endpoints
- `POST /api/chat` - Main chat interface
- `POST /api/translate` - Text translation
- `GET /api/search/suggestions` - Query suggestions
- `GET /api/groundwater/assessments` - Assessment data

## 🌍 Multi-Language Support

The application supports real-time translation to:
- हिंदी (Hindi)
- தமிழ் (Tamil) 
- తెలుగు (Telugu)
- বাংলা (Bengali)
- मराठी (Marathi)
- ગુજરાતી (Gujarati)
- ಕನ್ನಡ (Kannada)
- മലയാളം (Malayalam)
- ਪੰਜਾਬੀ (Punjabi)
- ଓଡ଼ିଆ (Odia)

## 🛠️ Development

### Project Structure
```
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared TypeScript types
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS config
└── tsconfig.json          # TypeScript configuration
```

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run check      # Type checking
npm run db:push    # Push database schema
```

### Adding New Features
1. **Frontend Components**: Add to `client/src/components/`
2. **API Endpoints**: Add to `server/routes.ts`
3. **Database Models**: Update `shared/schema.ts`
4. **UI Components**: Use shadcn/ui patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing component patterns
- Add proper error handling
- Include tests for new features

## 📱 Usage Examples

### Basic Queries
```
"Show me groundwater data for Maharashtra"
"What is the extraction rate in Punjab?"
"Compare Gujarat and Rajasthan water levels"
```

### Advanced Queries
```
"Show me the latest assessment for Telangana"
"Which states are over-exploited in 2024?"
"Historical trends for Tamil Nadu groundwater"
```

## 🔒 Security

- Environment variables for sensitive data
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure session management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Central Ground Water Board (CGWB)** for groundwater assessment data
- **Google Gemini AI** for natural language processing
- **shadcn/ui** for beautiful UI components
- **Replit** for development platform

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for sustainable groundwater management in India**