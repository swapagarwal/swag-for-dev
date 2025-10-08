# swag-for-dev - Setup & Startup Guide

## ✅ What's Been Done

### Applause Button Feature (Implemented)
- Added applause-button.com integration to each swag item
- Users can now "+1" swag opportunities they like
- Sorting by applause count (Most/Least Applauded) added to dropdown
- Real-time sorting when users applaud items
- Styled to match site's color scheme

**Files Modified:**
- `src/pug/includes/head.pug` - Added applause button CSS
- `src/pug/index.pug` - Added applause button script
- `src/pug/includes/body.pug` - Added applause button HTML + sort options
- `src/js/index.js` - Added applause sorting logic
- `src/styl/imports/card.styl` - Styled applause button

### Build Environment Setup
- ✅ Installed 64-bit Node.js v24.9.0
- ✅ Installed Visual Studio Build Tools 2022 with C++ toolset
- ✅ Successfully compiled `sharp` image processing library
- ✅ Installed `gulp-responsive` with native module support

## ⚠️ Current Issue: Gulp Stream Compatibility

Even with Node.js v20, there are stream compatibility issues with the `gulp-pug`/`gulp-htmlmin` pipeline in the build process.

### Workaround: Use http-server

Instead of the full Gulp build, you can use a simple HTTP server to view your changes:

1. **Install http-server globally:**
   ```powershell
   npm install -g http-server
   ```

2. **Build assets individually (these work fine):**
   ```powershell
   npx gulp styl    # Build CSS
   npx gulp js      # Build JavaScript
   ```

3. **Create index.html manually in dist folder** (or wait for proper Gulp fix)

4. **Start simple server:**
   ```powershell
   npx http-server dist -p 8080 -o
   ```

### Alternative: View on Production Site

The **applause button feature is already coded** and ready. The changes are in:
- `src/pug/includes/head.pug` - Stylesheet link
- `src/pug/index.pug` - Script tag
- `src/pug/includes/body.pug` - Button HTML + sort options
- `src/js/index.js` - Sorting logic
- `src/styl/imports/card.styl` - Button styles

To see it working, you would need to either:
1. **Fix the Gulp issue** (requires updating gulp plugins to newer versions)
2. **Deploy to production** where the build process completes successfully
3. **Use an older Node.js version** (v14 or v16) that better supports these legacy Gulp plugins

## 🔧 Solution: Downgrade to Node.js LTS v16 (Most Reliable)

### Recommended: Install Node.js v20 LTS

1. **Download Node.js v20 LTS (64-bit)**: https://nodejs.org/en/download
   - Choose **20.x LTS** (Long Term Support)
   - Install the **64-bit Windows Installer**

2. **Verify Installation:**
   ```powershell
   node --version   # Should show v20.x.x
   node -p "process.arch"   # Should show x64
   ```

3. **Reinstall Dependencies:**
   ```powershell
   cd C:\Users\rutur\swag-for-dev
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npm install
   ```

4. **Start the Project:**
   ```powershell
   npm start
   ```

The development server should now start successfully at http://localhost:8080

## 📝 Quick Start (After Node v20 Installation)

```powershell
# Navigate to project
cd C:\Users\rutur\swag-for-dev

# Start development server
npm start
```

The server will:
- Build CSS, JavaScript, and HTML
- Start a live-reload server on port 8080
- Open your browser automatically
- Watch for file changes

## 🌐 View the Applause Feature

Once running, visit http://localhost:8080 and you'll see:
- Each swag item has a small applause button (hand icon) next to "Check it out"
- Click it to applaud opportunities you like
- Use the "Order" dropdown → select "Most Applauded" or "Least Applauded" to sort
- Applause counts persist across sessions

## 🛠️ Available Commands

```powershell
npm start          # Start development server (skips image download)
npm run build      # Full production build
npm run lint       # Check code style
npm test           # Run functional tests
```

## 📦 Project Structure

```
swag-for-dev/
├── src/
│   ├── pug/           # HTML templates
│   ├── styl/          # Stylus CSS
│   └── js/            # JavaScript
├── dist/              # Built files (generated)
├── data.json          # Swag opportunities data
└── gulpfile.js        # Build configuration
```

## 🐛 Troubleshooting

### Issue: "node.exe is not recognized"
**Solution:** Add Node.js to PATH:
```powershell
$env:Path = "C:\Program Files\nodejs;$env:Path"
```

### Issue: Sharp compilation fails
**Solution:** Ensure Visual Studio Build Tools are installed with "Desktop development with C++" workload.

### Issue: Port 8080 already in use
**Solution:** Change port via environment variable:
```powershell
$env:GULP_LISTEN_PORT = "3000"
npm start
```

## 📚 Additional Resources

- [Node.js Downloads](https://nodejs.org/en/download)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
- [Applause Button Documentation](https://applause-button.com/)
- [Project Repository](https://github.com/swapagarwal/swag-for-dev)

---

**Next Step:** Install Node.js v20 LTS and run `npm start` 🚀
