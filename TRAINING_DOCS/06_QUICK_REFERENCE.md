
# TAMBO MCP Integration Suite - Quick Reference

## 🚀 Quick Start Commands

### Essential Operations
```typescript
// Route a request
const result = await abacusClient.routeRequest('Pro', 'user request text');

// Update a component  
const updated = await tamboClient.updateComponent('component-id', changes);

// Search across tools
const results = await crossToolSearch.searchUnified('search query');

// Process MCP command
const response = await commandEngine.processCommand('natural language command');
```

## 🎯 Agent Routing Quick Reference

| Keywords | Agent | Route | Use For |
|----------|-------|-------|---------|
| support, error, issue, bug | TriageAgent | `/triage` | Technical support |
| blog, article, content, media | ContentRouterAgent | `/content` | Content management |
| feedback, comment, review | FeedbackMinerAgent | `/feedback` | User feedback |
| pricing, upgrade, billing | PricingIntelligenceAgent | `/pricing` | Pricing queries |
| log, audit, compliance | AuditAgent | `/audit` | Compliance tracking |

## 🔧 Component IDs Reference

### Navigation Components
- `nav-header` - Main navigation header
- `nav-sidebar` - Side navigation panel  
- `nav-mobile` - Mobile navigation menu
- `nav-breadcrumb` - Breadcrumb navigation

### UI Components  
- `button-primary` - Primary action buttons
- `button-secondary` - Secondary action buttons
- `card-component` - Card layout components
- `modal-dialog` - Modal dialogs
- `form-input` - Form input fields

### Layout Components
- `page-header` - Page header sections
- `page-footer` - Page footer sections  
- `content-main` - Main content areas
- `sidebar-left` - Left sidebar panels

## 🛡️ Safety Quick Checks

### Protected Components (Cannot Modify)
```typescript
const PROTECTED = [
  'core-layout',      // ❌ Never modify
  'main-navigation',  // ❌ Never modify  
  'app-shell',        // ❌ Never modify
  'error-boundary'    // ❌ Never modify
];
```

### Safe Modification Examples
```typescript
// ✅ Safe changes
const safeChanges = {
  style: { color: 'blue', fontSize: '16px' },
  props: { title: 'New Title', disabled: false },
  className: 'new-class-name'
};

// ❌ Dangerous changes  
const dangerousChanges = {
  innerHTML: '<script>alert("hack")</script>',
  eval: 'dangerous code',
  onclick: 'window.location = "malicious-site.com"'
};
```

## 📊 Rate Limits

| Operation | Limit | Reset Period |
|-----------|--------|-------------|
| TAMBO API Requests | 30/minute | 1 minute |
| Component Updates | 10/hour | 1 hour |
| ABACUS Routing | Unlimited | - |
| Cross-tool Search | 20/hour | 1 hour |
| MCP Sync Operations | 1/30 seconds | 30 seconds |

## 🔍 Error Codes Quick Fix

| Error Code | Quick Fix |
|------------|-----------|
| 401 Unauthorized | Check API key |
| 403 Forbidden | Verify permissions |
| 429 Rate Limited | Wait and retry |
| 500 Server Error | Check service status |
| "Component protected" | Use non-protected component |
| "Dangerous code" | Remove unsafe patterns |

## 🧪 Testing Commands

### Test Connectivity
```typescript
// Test ABACUS
await abacusClient.routeRequest('Pro', 'test connection');

// Test TAMBO  
await tamboClient.getComponent('test-component');

// Test MCP
await mcpSync.getSyncStatus();
```

### Mock Data for Testing
```typescript
// Mock routing response
const mockRouting = {
  agent: 'TriageAgent',
  tier: 'Pro',
  intent: 'support_request',
  route: '/triage',
  confidence: 0.95
};

// Mock component  
const mockComponent = {
  id: 'test-button',
  name: 'Test Button',
  code: '<button>Test</button>',
  category: 'ui'
};
```

## 🎭 Role Permissions Matrix

| Feature | CEO | Developer | Content Mgr | Support |
|---------|-----|-----------|-------------|---------|
| Route Requests | ✅ | ✅ | ✅ | ✅ |
| Update Components | ✅ | ✅ | ❌ | ❌ |
| Agent Diagnostics | ✅ | ✅ | ❌ | ✅ |
| Cross-tool Search | ✅ | ✅ | ✅ | ❌ |
| Protected Components | ✅ | ❌ | ❌ | ❌ |
| Safe Mode Override | ✅ | ❌ | ❌ | ❌ |

## 📱 Environment Configurations

### Development
```typescript
const devConfig = {
  tamboApiUrl: 'https://api-dev.tambo.co/v1',
  abacusAppId: 'dev-1573da0c2c',
  mockMode: true,
  debugLogs: true,
  safeMode: true
};
```

### Production  
```typescript
const prodConfig = {
  tamboApiUrl: 'https://api.tambo.co/v1',
  abacusAppId: '1573da0c2c',
  mockMode: false,
  debugLogs: false,
  safeMode: true
};
```

## 🚨 Emergency Procedures

### Quick Reset
```typescript
// Clear everything and restart
abacusClient.clearHistory();
tamboClient.enableSafeMode();
await mcpSync.reinitialize();
window.location.reload();
```

### Check System Health
```typescript
const healthCheck = async () => {
  const status = {
    abacus: await testAbacusConnection(),
    tambo: await testTamboConnection(), 
    mcp: await testMCPConnection()
  };
  console.log('System Health:', status);
};
```

## 📞 Support Contacts

### Internal Support
- **Team Lead**: For component and integration issues
- **DevOps**: For API and infrastructure issues  
- **Admin**: For permissions and access issues

### External Support
- **TAMBO Support**: `support@tambo.co`
- **ABACUS Support**: Via ABACUS platform
- **Emergency**: Use escalation procedures

## 🔗 Important URLs

### Production URLs
- TAMBO API: `https://api.tambo.co/v1`
- ABACUS Chatbot: `https://apps.abacus.ai/chatllm/?appId=1573da0c2c`

### Development URLs  
- TAMBO Dev API: `https://api-dev.tambo.co/v1`
- Local Development: `http://localhost:5173`

### Documentation
- API Docs: Internal documentation server
- Component Library: TAMBO documentation portal
- MCP Specification: Internal MCP documentation

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Submit Request | `Ctrl + Enter` |
| Clear Form | `Ctrl + Shift + C` |
| Toggle Dev Mode | `Ctrl + D` |
| Open Diagnostics | `Ctrl + Shift + D` |
| Force Refresh | `Ctrl + F5` |

---
*Keep this guide handy for quick reference during daily operations*
