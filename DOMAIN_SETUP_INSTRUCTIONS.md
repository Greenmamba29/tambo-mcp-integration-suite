# 🌐 Domain Setup Instructions for FilesInASnap.com

## 🚨 Critical Next Step Required

After deploying the updated `vercel.json`, you **MUST** configure the domains manually in Vercel Dashboard to resolve the SSL certificate issue.

## 📋 Step-by-Step Domain Configuration

### Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Sign in to your account
3. Find and click on your project: `tambo-mcp-integration-suite`

### Step 2: Navigate to Domain Settings
1. Click on your project name
2. Go to **Settings** tab
3. Click on **Domains** in the left sidebar

### Step 3: Add Primary Domain
1. Click **"Add"** button
2. Enter: `filesinasnap.com`
3. Click **"Add"**
4. Select **"Assign Domain"** when prompted
5. Set this as the **Primary Domain**

### Step 4: Add WWW Subdomain
1. Click **"Add"** button again  
2. Enter: `www.filesinasnap.com`
3. Click **"Add"**
4. Select **"Redirect to filesinasnap.com"** option
5. Choose **"Permanent Redirect (308)"**

### Step 5: Verify SSL Certificate Status
After adding both domains, check:
- ✅ `filesinasnap.com` shows **"SSL Certificate: Active"**
- ✅ `www.filesinasnap.com` shows **"Redirect to filesinasnap.com"**
- ⏳ Wait 5-10 minutes for SSL certificate provisioning

## 🔧 DNS Configuration (If You Own the Domain)

If you control the DNS for filesinasnap.com, ensure these records exist:

### A Record
```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.61
TTL: 300 (or Auto)
```

### CNAME Record
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (or Auto)
```

### Alternative: Use Vercel Nameservers
If you want Vercel to manage DNS completely:
1. In Domain settings, click **"Use Vercel Nameservers"**
2. Update your domain registrar to use:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

## ✅ Verification Checklist

After completing domain setup, verify:

### 1. Domain Status in Vercel
- [ ] `filesinasnap.com` shows "Active" with SSL certificate
- [ ] `www.filesinasnap.com` shows "Redirect" status
- [ ] No error messages in domain configuration

### 2. SSL Certificate Test
```bash
# Should return HTTP 200 without certificate errors
curl -I https://filesinasnap.com

# Should return HTTP 308 redirect
curl -I https://www.filesinasnap.com
```

### 3. Browser Testing
- [ ] Safari: https://filesinasnap.com loads without security warning
- [ ] Chrome: https://filesinasnap.com shows secure padlock
- [ ] Firefox: https://filesinasnap.com shows secure connection
- [ ] WWW redirect: https://www.filesinasnap.com redirects to main domain

## 🚨 Troubleshooting Common Issues

### Issue: "Domain not found"
**Solution**: 
1. Double-check domain spelling
2. Verify DNS propagation with: https://dnschecker.org/
3. Wait up to 24 hours for global DNS propagation

### Issue: "SSL Certificate Pending"
**Solution**:
1. Wait 5-10 minutes for automatic certificate provisioning
2. Check domain verification status in Vercel Dashboard
3. Ensure DNS records point correctly to Vercel

### Issue: "Certificate Name Mismatch"
**Solution**:
1. Verify both domains are added to Vercel project
2. Ensure www domain is set to redirect to primary domain
3. Clear browser cache and test in incognito mode

### Issue: "Connection is not private" still appears
**Solution**:
1. Wait for SSL certificate to fully propagate (up to 1 hour)
2. Test with online SSL checker: https://www.ssllabs.com/ssltest/
3. Clear all browser data and cookies for the domain

## ⏱️ Expected Timeline

- **Immediate**: Domain configuration saved in Vercel
- **2-5 minutes**: SSL certificate provisioning starts
- **5-10 minutes**: SSL certificate becomes active
- **15-30 minutes**: Global CDN propagation
- **Up to 1 hour**: Complete DNS propagation worldwide

## 📞 Support Resources

If issues persist:
1. **Vercel Support**: https://vercel.com/support
2. **SSL Checker**: https://www.ssllabs.com/ssltest/
3. **DNS Propagation**: https://dnschecker.org/
4. **Certificate Transparency**: https://crt.sh/

## 🎯 Success Indicators

You'll know it's working when:
- ✅ No more "This Connection Is Not Private" warnings
- ✅ TAMBO MCP Integration Suite loads properly
- ✅ All browser security indicators show green/secure
- ✅ Both http and https redirects work correctly
- ✅ WWW subdomain redirects to main domain

## 🚀 Final Test

After completing all steps, test with:
```bash
# All of these should work without SSL errors:
curl -I https://filesinasnap.com
curl -I https://www.filesinasnap.com
curl -I http://filesinasnap.com
curl -I http://www.filesinasnap.com
```

**Expected Results**:
- Primary domain: SSL certificate valid, content loads
- WWW domain: Redirects to primary domain
- HTTP versions: Redirect to HTTPS automatically
