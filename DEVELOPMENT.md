# 🛠️ Development Guide

**Everything you need to start developing for Bezpieczny Pomocnik**

---

## 🚀 **Getting Started**

### **Prerequisites**
- **Git** - Version control
- **Python 3.11+** - Backend development
- **Modern browser** - Frontend testing (Chrome, Firefox, Safari)
- **Code editor** - VS Code recommended with extensions:
  - Live Server
  - Python
  - Prettier
  - ESLint

### **Quick Setup (5 minutes)**
```bash
# 1. Fork and clone
git clone https://github.com/YOUR-USERNAME/Bezpieczny_pomocnik.git
cd Bezpieczny_pomocnik

# 2. Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Start backend
python -m uvicorn main:app --reload

# 4. Start frontend (new terminal)
cd ../frontend
# Use Live Server extension or open index.html directly
```

---

## 📁 **Project Structure**

```
Bezpieczny_pomocnik/
├── frontend/                 # Frontend application
│   ├── index.html           # Main application entry
│   ├── app.js              # Core application logic
│   ├── sw.js               # Service Worker (PWA)
│   ├── styles/             # CSS and styling
│   ├── images/             # Icons and graphics
│   └── translations/       # Multi-language support
├── backend/                  # Backend API
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── config.py           # Configuration settings
│   └── tests/              # Backend tests
├── api/                     # Vercel serverless functions
│   ├── index.py            # Main API entry
│   └── vapid.py            # Push notification endpoints
├── docs/                    # Documentation
├── legal/                   # Legal documents
└── .github/                 # GitHub configuration
    ├── workflows/          # CI/CD pipelines
    ├── ISSUE_TEMPLATE/     # Issue templates
    └── pull_request_template.md
```

---

## 🎨 **Frontend Development**

### **Technology Stack**
- **Vanilla JavaScript** - No frameworks, lightweight
- **Service Worker** - PWA functionality
- **Web Crypto API** - Client-side encryption
- **IndexedDB** - Local storage
- **CSS Grid/Flexbox** - Modern layouts
- **Web Speech API** - Text-to-speech

### **Key Files**
```javascript
// frontend/app.js - Main application logic
// Contains: UI interactions, API calls, safety features

// frontend/sw.js - Service Worker
// Contains: PWA functionality, offline support, push notifications

// frontend/styles/main.css - Styling
// Contains: Responsive design, animations, accessibility
```

### **Development Workflow**
```bash
# 1. Open frontend in browser
open frontend/index.html

# 2. Use browser DevTools for debugging
# F12 → Console, Network, Application tabs

# 3. Test PWA features
# Chrome DevTools → Application → Service Workers
# Chrome DevTools → Application → Manifest

# 4. Test responsive design
# Chrome DevTools → Device toolbar
```

### **Frontend Guidelines**
- ✅ Use modern ES6+ syntax
- ✅ Follow existing naming conventions
- ✅ Add JSDoc comments for functions
- ✅ Test in multiple browsers
- ✅ Ensure accessibility (ARIA labels, keyboard navigation)
- ✅ Use semantic HTML5 elements

---

## ⚡ **Backend Development**

### **Technology Stack**
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **WebPush** - Push notification library
- **Feedparser** - RSS/Atom parsing

### **Key Files**
```python
# backend/main.py - Main FastAPI application
# Contains: API endpoints, CORS, static files

# backend/config.py - Configuration
# Contains: Environment variables, settings

# backend/tests/ - Test suite
# Contains: Unit tests, integration tests
```

### **Development Workflow**
```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Start development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. View API documentation
# Open http://localhost:8000/docs

# 4. Run tests
pytest backend/tests/
```

### **Backend Guidelines**
- ✅ Follow PEP 8 style guide
- ✅ Use type hints for function signatures
- ✅ Add docstrings for all functions
- ✅ Handle errors gracefully
- ✅ Validate input data with Pydantic
- ✅ Use async/await for I/O operations

---

## 🔧 **API Development**

### **Available Endpoints**
```bash
# Backend API (localhost:8000)
GET  /api/vapid_public_key     # Push notification public key
POST /api/subscribe            # Save push subscription
GET  /api/alerts               # Get safety alerts
POST /api/push/test           # Send test notification

# Static files
GET  /                         # Frontend application
GET  /frontend/*              # Frontend assets
```

### **Adding New Endpoints**
```python
# 1. Define Pydantic model
from pydantic import BaseModel
class NewFeatureRequest(BaseModel):
    data: str
    user_id: str

# 2. Create endpoint
@app.post("/api/new-feature")
async def new_feature(request: NewFeatureRequest):
    # Your logic here
    return {"status": "success"}
```

### **API Testing**
```bash
# Test with curl
curl -X POST http://localhost:8000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "..."}'

# Test with Python requests
import requests
response = requests.get("http://localhost:8000/api/alerts")
print(response.json())
```

---

## 📱 **PWA Development**

### **Service Worker Features**
- **Offline caching** - Cache essential resources
- **Push notifications** - Receive safety alerts
- **Background sync** - Sync data when online
- **App installation** - Installable on home screen

### **Testing PWA**
```bash
# 1. Chrome DevTools → Application
# 2. Check Service Worker status
# 3. Test offline functionality
# 4. Verify manifest properties
```

### **PWA Guidelines**
- ✅ Cache essential resources for offline use
- ✅ Implement push notification handling
- ✅ Provide offline fallback pages
- ✅ Test on mobile devices
- ✅ Ensure app works without network

---

## 🔒 **Security Development**

### **Key Security Features**
- **AES-256-GCM encryption** - Client-side data protection
- **Zero-knowledge proofs** - Privacy-preserving authentication
- **CORS configuration** - Cross-origin security
- **Input validation** - Prevent injection attacks
- **HTTPS enforcement** - Secure communication

### **Security Guidelines**
- ✅ Never store sensitive data in plain text
- ✅ Validate all user inputs
- ✅ Use secure headers (CSP, HSTS)
- ✅ Implement proper error handling
- ✅ Follow OWASP security best practices
- ✅ Test for common vulnerabilities

---

## 🧪 **Testing**

### **Frontend Testing**
```bash
# Manual testing checklist
- [ ] App loads without errors
- [ ] All buttons work
- [ ] Forms validate correctly
- [ ] Responsive design works
- [ ] Accessibility features work
- [ ] PWA functions properly
```

### **Backend Testing**
```bash
# Run automated tests
cd backend
pytest tests/ -v

# Run specific test
pytest tests/test_alerts.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html
```

### **Integration Testing**
```bash
# Test full workflow
1. Start backend server
2. Open frontend application
3. Test alert subscription
4. Verify push notifications
5. Test offline functionality
```

---

## 📊 **Performance Optimization**

### **Frontend Performance**
- **Lazy loading** - Load resources as needed
- **Code splitting** - Separate critical and non-critical code
- **Image optimization** - Compress and resize images
- **Caching strategy** - Cache static assets appropriately

### **Backend Performance**
- **Async operations** - Use async/await for I/O
- **Database optimization** - Efficient queries
- **Caching** - Cache frequently accessed data
- **Rate limiting** - Prevent abuse

### **Performance Monitoring**
```bash
# Chrome DevTools → Performance
# Record user interactions
# Analyze bottlenecks
# Optimize slow operations

# Backend monitoring
# Check response times
# Monitor memory usage
# Track error rates
```

---

## 🌍 **Internationalization**

### **Adding New Languages**
```javascript
// 1. Create translation file
// frontend/translations/fr.json
{
  "app_title": "Aide de Sécurité",
  "emergency_button": "Urgence"
}

// 2. Add language option
const translations = {
  'pl': polishTranslations,
  'en': englishTranslations,
  'fr': frenchTranslations  // New language
};
```

### **Localization Guidelines**
- ✅ Use translation keys instead of hardcoded text
- ✅ Test text expansion (some languages are longer)
- ✅ Consider cultural differences
- ✅ Test right-to-left languages if needed
- ✅ Ensure accessibility in all languages

---

## 🚀 **Deployment**

### **Local Development**
```bash
# Frontend - Use Live Server
# Backend - Python development server
python -m uvicorn main:app --reload
```

### **Production Deployment**
- **Frontend:** GitHub Pages (automatic)
- **Backend:** Vercel serverless functions
- **Domain:** pomocnikapp.vercel.app

### **Deployment Checklist**
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Security headers set
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Legal documents checked

---

## 🤝 **Contributing Guidelines**

### **Before Submitting**
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No sensitive data included
- [ ] Accessibility is maintained
- [ ] Performance impact considered

### **Pull Request Process**
1. Create feature branch from main
2. Make changes with clear commits
3. Test thoroughly
4. Submit pull request with description
5. Respond to review feedback
6. Merge after approval

---

## 📞 **Getting Help**

### **Documentation**
- 📖 [Contributing Guide](CONTRIBUTING.md)
- 🔒 [Security Policy](SECURITY.md)
- 📄 [License Information](LICENSE)

### **Community Support**
- 💬 GitHub Issues - Report bugs or request features
- 📧 Email: kontakt@fundacja-hospicjum.org
- 🏆 Contributor recognition program

### **Technical Resources**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## 🎯 **Development Best Practices**

### **Code Quality**
- ✅ Write readable, maintainable code
- ✅ Add meaningful comments
- ✅ Follow consistent naming conventions
- ✅ Keep functions small and focused
- ✅ Handle errors gracefully

### **Child Safety Focus**
- ✅ Always consider child safety implications
- ✅ Test with children in mind
- ✅ Ensure accessibility for all ages
- ✅ Protect privacy and security
- ✅ Provide clear, simple instructions

### **Performance**
- ✅ Optimize for mobile devices
- ✅ Minimize network requests
- ✅ Use efficient algorithms
- ✅ Monitor and improve load times
- ✅ Test on slow connections

---

**Happy coding!** 🎉

*Remember: Every line of code you write helps keep children safer.* ❤️

---

*Last updated: November 2025*
