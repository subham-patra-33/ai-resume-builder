# Templates Feature - API Integration Guide

## Overview

This guide explains how to integrate the Templates feature with your backend API. The feature is currently designed with fallback support, meaning it works with or without a connected backend.

---

## API Requirements

### Required Endpoints

#### 1. List Templates

**Endpoint:** `GET /api/templates` (or custom endpoint)

**Request:**
```http
GET /api/templates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "modern-minimal",
      "name": "Modern Minimal",
      "category": "modern",
      "description": "Clean, minimal design...",
      "preview": "<div>...</div>",
      "features": ["Modern design", "Easy to read", "ATS-friendly"],
      "color": "#3b82f6"
    },
    ...
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Failed to load templates",
  "error": "details"
}
```

---

#### 2. Get Single Template (Optional)

**Endpoint:** `GET /api/templates/:id`

**Request:**
```http
GET /api/templates/modern-minimal
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "modern-minimal",
    "name": "Modern Minimal",
    "category": "modern",
    "description": "...",
    "preview": "<div>...</div>",
    "features": ["..."],
    "color": "#3b82f6"
  }
}
```

---

#### 3. Create Resume from Template

**Endpoint:** `POST /api/resumes`

**Request:**
```http
POST /api/resumes
Authorization: Bearer <token>
Content-Type: application/json

{
  "templateId": "modern-minimal",
  "templateName": "Modern Minimal",
  "templateColor": "#3b82f6",
  "title": "John Doe's Resume",
  "content": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "location": "New York, NY",
    "title": "Software Engineer",
    "summary": "Results-driven engineer...",
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Engineer",
        "duration": "2021 - Present",
        "description": "Led team..."
      }
    ],
    "education": [
      {
        "school": "MIT",
        "degree": "B.S.",
        "field": "Computer Science",
        "year": "2020"
      }
    ],
    "skills": "JavaScript, React, Python",
    "certifications": "AWS Certified"
  },
  "design": "<div>...</div>"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "resume-123abc",
    "_id": "resume-123abc",
    "userId": "user-456def",
    "templateId": "modern-minimal",
    "title": "John Doe's Resume",
    "content": {...},
    "createdAt": "2026-04-08T10:30:00Z",
    "updatedAt": "2026-04-08T10:30:00Z"
  }
}
```

---

## Implementation in API Client

### Current Implementation (src/lib/api.js)

The API client should include these methods:

```javascript
// api.js

// List all templates
const listTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch templates');
    
    const data = await response.json();
    return data.data || data; // Handle different response formats
  } catch (error) {
    console.error('Template fetch error:', error);
    return { error: true, message: error.message };
  }
};

// Get single template
const getTemplate = async (templateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch template');
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Template fetch error:', error);
    return { error: true, message: error.message };
  }
};

// Create resume from template
const createResume = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error('Failed to create resume');
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Resume creation error:', error);
    return { error: true, message: error.message };
  }
};

// Export API methods
const API = {
  listTemplates,
  getTemplate,
  createResume,
  // ... other methods
};

export default API;
```

---

## Fallback System

### How Fallback Works

The Templates feature includes a built-in fallback system:

```javascript
// In Templates.jsx
useEffect(() => {
  async function load() {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API
      const resp = await API.listTemplates?.();
      if (resp && !resp.error && resp.length > 0) {
        setTemplates(resp);  // Use API templates
      }
    } catch (err) {
      // Silently fail - use built-in templates
    } finally {
      setLoading(false);
    }
  }
  
  load();
}, []);

// Default templates (built-in fallback)
const [templates, setTemplates] = useState(RESUME_TEMPLATES);
```

**Fallback Priority:**
1. API returns templates → Use API templates
2. API fails/empty → Use built-in RESUME_TEMPLATES
3. Provides graceful degradation

---

## Backend Implementation Examples

### Node.js/Express Example

```javascript
// routes/templates.js
const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { auth } = require('../middleware/auth');

// Get all templates
router.get('/api/templates', auth, async (req, res) => {
  try {
    const templates = await Template.find({ active: true });
    res.json({ status: 'success', data: templates });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch templates',
      error: error.message 
    });
  }
});

// Get single template
router.get('/api/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Template not found' 
      });
    }
    res.json({ status: 'success', data: template });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch template',
      error: error.message 
    });
  }
});

// Create resume
router.post('/api/resumes', auth, async (req, res) => {
  try {
    const { templateId, title, content, design } = req.body;
    
    // Validate input
    if (!content?.fullName) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Full name required' 
      });
    }
    
    // Create resume document
    const resume = new Resume({
      userId: req.user.id,
      templateId,
      title,
      content,
      design,
    });
    
    await resume.save();
    
    res.status(201).json({ 
      status: 'success', 
      data: resume 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create resume',
      error: error.message 
    });
  }
});

module.exports = router;
```

### Database Schema Example

```javascript
// models/Template.js
const templateSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['modern', 'professional', 'creative'],
    required: true,
  },
  description: String,
  preview: {
    type: String,  // HTML content
    required: true,
  },
  features: [String],
  color: String,
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// models/Resume.js
const resumeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: String,
  templateName: String,
  title: String,
  content: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    title: String,
    summary: String,
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
    }],
    education: [{
      school: String,
      degree: String,
      field: String,
      year: String,
    }],
    skills: String,
    certifications: String,
  },
  design: String,  // HTML template
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});
```

---

## Integration Steps

### Step 1: Update API Client

Update or create `src/lib/api.js`:

```javascript
// Check if methods exist
const API = {
  listTemplates: async () => { ... },
  getTemplate: async (id) => { ... },
  createResume: async (payload) => { ... },
};

export default API;
```

### Step 2: Test API Endpoints

```bash
# Test list templates
curl -H "Authorization: Bearer token" \
     http://localhost:3000/api/templates

# Test create resume
curl -X POST \
     -H "Authorization: Bearer token" \
     -H "Content-Type: application/json" \
     -d '{"templateId":"...","content":{...}}' \
     http://localhost:3000/api/resumes
```

### Step 3: Monitor Frontend

Open browser console to check:
- API calls in Network tab
- Errors in Console
- State in React DevTools

### Step 4: Test User Flows

1. **Template Browsing:**
   - Templates load (API or fallback)
   - Search works
   - Filters work

2. **Resume Building:**
   - Template loads in builder
   - Form fields work
   - Preview updates

3. **Resume Saving:**
   - Form validates
   - API called
   - Resume created
   - Redirect works

---

## Error Handling

### Common Error Scenarios

**1. API Not Responding**
```javascript
// Handled by fallback system
- Uses built-in templates
- Shows continue working
- No error blocking flow
```

**2. Invalid Template Data**
```javascript
// Validation in component
if (!template?.id) {
  setError('Invalid template');
}
```

**3. Save Failure**
```javascript
// Error banner displayed
{error && (
  <div className="p-4 bg-red-100 text-red-700">
    {error}
    <button onClick={() => setError(null)}>×</button>
  </div>
)}
```

### Error Recovery

- Users can retry form submission
- Download before save as backup
- Navigate away without losing data (form persists)
- Clear errors and continue

---

## Performance Optimization

### API Optimization Tips

1. **Template Caching:**
   ```javascript
   // Cache templates for 1 hour
   const CACHE_KEY = 'resume_templates';
   const CACHE_DURATION = 3600000; // 1 hour
   
   async function getTemplates() {
     const cached = localStorage.getItem(CACHE_KEY);
     const timestamp = localStorage.getItem(CACHE_KEY + '_time');
     
     if (cached && Date.now() - timestamp < CACHE_DURATION) {
       return JSON.parse(cached);
     }
     
     const data = await API.listTemplates();
     localStorage.setItem(CACHE_KEY, JSON.stringify(data));
     localStorage.setItem(CACHE_KEY + '_time', Date.now());
     return data;
   }
   ```

2. **Lazy Load HTML:**
   ```javascript
   // Load template HTML only when needed
   async function loadTemplateDesign(templateId) {
     return await fetch(`/api/templates/${templateId}/design`);
   }
   ```

3. **Pagination:**
   ```javascript
   // For 100+ templates
   async function getTemplates(page = 1, limit = 12) {
     return await fetch(`/api/templates?page=${page}&limit=${limit}`);
   }
   ```

---

## Security Considerations

### Authentication
- All API calls include Authorization header
- Token stored in localStorage
- Refresh token mechanism recommended

### Input Validation
- Validate all form inputs before API call
- Server-side validation required
- Sanitize HTML content

### Rate Limiting
- Implement rate limiting on backend
- Prevent abuse of template API
- Throttle resume creation requests

### CORS
- Configure CORS for API domain
- Allow frontend domain in CORS headers
- Use secure credentials

---

## Testing

### API Testing

```javascript
// Test templates loading
test('fetches templates from API', async () => {
  const templates = await API.listTemplates();
  expect(templates).toBeDefined();
  expect(templates.length).toBeGreaterThan(0);
});

// Test resume creation
test('creates resume with template', async () => {
  const resume = await API.createResume({
    templateId: 'modern-minimal',
    title: 'Test Resume',
    content: { fullName: 'Test User' },
  });
  expect(resume.id).toBeDefined();
});
```

### Integration Testing

```javascript
// Test full flow
test('complete template to resume flow', async () => {
  // Load templates
  const templates = await API.listTemplates();
  const selected = templates[0];
  
  // Create resume
  const resume = await API.createResume({
    templateId: selected.id,
    content: { fullName: 'John Doe' },
  });
  
  expect(resume.id).toBeDefined();
  expect(resume.templateId).toBe(selected.id);
});
```

---

## Deployment Checklist

- [ ] API endpoints implemented
- [ ] Database models created
- [ ] Authentication middleware added
- [ ] Error handling in backend
- [ ] CORS configured
- [ ] Rate limiting set up
- [ ] API tested with Postman/Thunder Client
- [ ] Frontend API client updated
- [ ] Error handling verified
- [ ] Fallback system tested
- [ ] Complete user flow tested
- [ ] Performance optimized
- [ ] Security review done
- [ ] Documentation updated

---

## Monitoring & Logging

### Recommended Monitoring

```javascript
// Log API calls
async function logApiCall(method, endpoint, status) {
  console.log(`[API] ${method} ${endpoint} - ${status}`);
  // Send to analytics service
}

// Monitor errors
window.addEventListener('error', (event) => {
  if (event.message.includes('template')) {
    // Log template-related errors
  }
});

// Performance monitoring
performance.mark('template-load-start');
await API.listTemplates();
performance.mark('template-load-end');
performance.measure('template-load', 'template-load-start', 'template-load-end');
```

### Logging Best Practices

- Log successful API calls
- Log all errors with context
- Track user actions (search, filter, select)
- Monitor performance metrics
- Alert on critical failures

---

## Support & Troubleshooting

### Common Integration Issues

**1. Templates not loading from API**
```
Check:
- API endpoint is correct
- Authentication token is valid
- CORS is configured
- Response format matches expected
- Built-in fallback templates load
```

**2. Resume save fails**
```
Check:
- Full name field filled (required)
- API endpoint responds correctly
- Payload structure matches backend
- User has permission to save
- Network connection is stable
```

**3. Preview not showing saved data**
```
Check:
- Template HTML is valid
- Text replacement logic works
- Form field names match replacements
- Preview HTML renders without errors
```

---

## Maintenance

### Regular Tasks

- Monitor API performance
- Update template collection
- Review error logs
- Test fallback system
- Update documentation
- Performance optimization

### Version Updates

- Bump API version when needed
- Maintain backward compatibility
- Update frontend API client
- Test all flows after updates
- Document breaking changes

---

## Additional Resources

- Express.js Documentation: https://expressjs.com
- MongoDB Schema Design: https://docs.mongodb.com
- CORS Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- API Security: https://owasp.org/www-project-api-security/

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Ready for Implementation
