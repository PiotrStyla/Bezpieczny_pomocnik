# 🤝 Contributing to Bezpieczny Pomocnik

**Thank you for considering contributing to our child safety application!**  
We welcome developers, designers, testers, and anyone who wants to help improve children's safety in Poland.

---

## 🎯 **Why Contribute?**

- 🛡️ **Impact:** Your code helps keep children safe
- 🌍 **Community:** Join developers passionate about child safety
- 📚 **Learning:** Work with modern tech stack (PWA, Serverless, AI)
- 🏆 **Recognition:** Contributors are acknowledged in our releases

---

## 🚀 **Quick Start**

### **Prerequisites**
- Git installed
- Basic knowledge of JavaScript/Python/HTML/CSS
- Passion for child safety! ❤️

### **Setup in 5 Minutes**
```bash
# 1. Fork the repository (click "Fork" button above)
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/Bezpieczny_pomocnik.git
cd Bezpieczny_pomocnik

# 3. Add upstream repository
git remote add upstream https://github.com/PiotrStyla/Bezpieczny_pomocnik.git

# 4. Create a branch for your contribution
git checkout -b feature/your-feature-name

# 5. Start coding! 🎉
```

---

## 🛠️ **How to Contribute**

### **🐛 Report Bugs**
Found something not working? We'd love to know!
1. Check [existing issues](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues)
2. [Create a new issue](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues/new/choose)
3. Use the "Bug Report" template
4. Provide as much detail as possible

### **💡 Suggest Features**
Have an idea to improve the app?
1. Check [existing feature requests](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues?q=is%3issue+is%0open+label%3enhancement)
2. [Create a new feature request](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues/new?assignees=&labels=enhancement&template=feature_request.md)
3. Describe the problem you're solving
4. Explain why it would help children's safety

### **🔧 Code Contributions**
Ready to write code? Awesome!

#### **Areas Where We Need Help**
- 🎨 **Frontend:** UI/UX improvements, accessibility, animations
- ⚡ **Backend:** API optimization, new alert sources, performance
- 📱 **Mobile:** PWA features, offline capabilities, push notifications
- 🌍 **Internationalization:** More languages, localization
- 🧪 **Testing:** Unit tests, integration tests, user testing
- 📚 **Documentation:** Guides, API docs, tutorials

#### **Development Workflow**
```bash
# 1. Keep your branch updated
git checkout main
git pull upstream main
git checkout feature/your-feature-name
git rebase main

# 2. Make your changes
# (code, code, code! 🎉)

# 3. Test your changes
# Frontend: Open frontend/index.html in browser
# Backend: cd backend && python -m uvicorn main:app --reload

# 4. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Create Pull Request
# Visit GitHub and click "New Pull Request"
```

---

## 📝 **Coding Guidelines**

### **JavaScript (Frontend)**
- Use modern ES6+ syntax
- Follow existing naming conventions
- Add comments for complex logic
- Test in multiple browsers (Chrome, Firefox, Safari)
- Ensure accessibility (screen readers, keyboard navigation)

### **Python (Backend)**
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings for functions
- Handle errors gracefully
- Test with different Python versions (3.11+)

### **General Rules**
- ✅ **Keep it simple** - readable code is better than clever code
- ✅ **Add comments** - explain the "why", not just "what"
- ✅ **Test thoroughly** - break things, then fix them
- ✅ **Think security** - this is a child safety app!
- ✅ **Be inclusive** - consider all users (children, parents, different abilities)

---

## 🧪 **Testing**

### **Manual Testing Checklist**
- [ ] App loads without errors
- [ ] All buttons work
- [ ] Alerts display correctly
- [ ] Push notifications work
- [ ] Offline mode functions
- [ ] Mobile responsive design
- [ ] Accessibility features work

### **Browser Testing**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

---

## 📤 **Submitting Pull Requests**

### **Before Submitting**
- [ ] Code follows our guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No sensitive data included

### **Pull Request Template**
Use our PR template and include:
- **What changed:** Brief description
- **Why changed:** Problem you're solving
- **How to test:** Steps to verify
- **Screenshots:** If UI changes
- **Breaking changes:** If any

---

## 🎨 **Design Contributions**

### **UI/UX Guidelines**
- Child-friendly interface
- Clear, readable fonts
- High contrast colors
- Large touch targets (48px minimum)
- Simple navigation
- Consistent design language

### **Assets**
- Icons should be SVG when possible
- Images optimized for web
- Colors accessible (WCAG AA)
- Animations subtle, not distracting

---

## 🌍 **Localization**

### **Adding New Languages**
1. Create language file in `frontend/translations/`
2. Add language option to UI
3. Test all text displays correctly
4. Update documentation

### **Current Languages**
- 🇵🇱 Polish (primary)
- 🇬🇧 English
- 🇺🇦 Ukrainian
- *[Add your language here!]*

---

## 🏆 **Recognition**

### **Contributor Badges**
- 🐛 **Bug Hunter** - Found and reported critical bugs
- 💡 **Feature Pioneer** - Suggested implemented features
- 🔧 **Code Champion** - Significant code contributions
- 🌍 **Global Guardian** - Localization contributions
- 📚 **Doc Master** - Documentation improvements

### **Hall of Fame**
All contributors are acknowledged in:
- README.md contributor section
- Release notes
- Annual foundation report
- Special contributor badge in app

---

## 💬 **Getting Help**

### **Questions?**
- 📧 Email: kontakt@fundacja-hospicjum.org
- 💬 GitHub Issues: [Create a question](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues/new?assignees=&labels=question&template=question.md)
- 📖 Documentation: Check existing guides first

### **Community**
- 👥 Join our contributor discussions
- 🎯 Participate in feature planning
- 📢 Share ideas and feedback
- 🤝 Collaborate with other developers

---

## 📋 **License Note**

By contributing, you agree that your contributions will be licensed under the same [Foundation Approval License](LICENSE) as the main project. This means:

- ✅ Your code is open for learning and development
- ❌ Commercial use requires Foundation permission
- 🛡️ Child safety always comes first

---

## 🎉 **Thank You!**

Every contribution helps make children safer. Whether you're:
- Writing code 📝
- Finding bugs 🐛
- Suggesting features 💡
- Improving documentation 📚
- Translating content 🌍
- Testing functionality 🧪

**You're making a difference!** 

---

## 📞 **Contact**

**Foundation Hospicjum**
- 📧 kontakt@fundacja-hospicjum.org
- 🔗 https://fundacja-hospicjum.org
- 📍 Kraków, Poland

**Technical Questions**
- 📧 Create GitHub Issue for fastest response
- 💬 Join our developer discussions

---

**Ready to contribute?** 🚀

[Start by forking the repository](https://github.com/PiotrStyla/Bezpieczny_pomocnik/fork) and make your first contribution today!

*Remember: Every line of code you write helps keep a child safer.* ❤️
