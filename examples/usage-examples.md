# Sample API Usage Examples

This document provides practical examples of how to use the Azure App Configuration Troubleshooting API.

## Example 1: Basic Health Check

### JavaScript
```javascript
const fetch = require('node-fetch');

async function checkHealth() {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    console.log('API Health:', data);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

checkHealth();
```

### PowerShell
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/health"
Write-Output "API Status: $($response.status)"
```

## Example 2: Get Complete Troubleshooting Guide

### JavaScript
```javascript
const fetch = require('node-fetch');

async function getTroubleshootingGuide() {
  try {
    const response = await fetch('http://localhost:3000/api/troubleshooting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: 'json'
      })
    });
    
    const data = await response.json();
    console.log('Guide Title:', data.title);
    console.log('Content Length:', data.metadata.contentLength);
    // Save to file or display content
    console.log(data.content);
  } catch (error) {
    console.error('Failed to fetch guide:', error);
  }
}

getTroubleshootingGuide();
```

### Python
```python
import requests
import json

def get_troubleshooting_guide():
    url = "http://localhost:3000/api/troubleshooting"
    payload = {
        "format": "json"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print(f"Guide Title: {data['title']}")
        print(f"Content Length: {data['metadata']['contentLength']}")
        
        # Save to file
        with open('troubleshooting-guide.md', 'w', encoding='utf-8') as f:
            f.write(data['content'])
        
        print("Guide saved to troubleshooting-guide.md")
        
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch guide: {e}")

get_troubleshooting_guide()
```

## Example 3: Get Specific Section

### JavaScript
```javascript
const fetch = require('node-fetch');

async function getImplementationSteps() {
  try {
    const response = await fetch('http://localhost:3000/api/troubleshooting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: 'json',
        section: 'implementation',
        requestId: `impl-${Date.now()}`
      })
    });
    
    const data = await response.json();
    console.log('Section:', data.section);
    console.log('Implementation Steps:');
    console.log(data.content);
  } catch (error) {
    console.error('Failed to fetch implementation steps:', error);
  }
}

getImplementationSteps();
```

### cURL
```bash
curl -X POST http://localhost:3000/api/troubleshooting \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "section": "queries",
    "requestId": "query-examples-001"
  }'
```

## Example 4: Get Available Sections

### JavaScript
```javascript
const fetch = require('node-fetch');

async function listSections() {
  try {
    const response = await fetch('http://localhost:3000/api/troubleshooting/sections');
    const data = await response.json();
    
    console.log('Available Sections:');
    data.sections.forEach(section => {
      console.log(`- ${section.id}: ${section.title}`);
      console.log(`  ${section.description}`);
    });
  } catch (error) {
    console.error('Failed to fetch sections:', error);
  }
}

listSections();
```

## Example 5: Interactive CLI Tool

### JavaScript (Node.js CLI)
```javascript
#!/usr/bin/env node

const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function interactiveTroubleshoot() {
  console.log('Azure App Configuration Troubleshooting Assistant');
  console.log('==============================================');
  
  try {
    // Get available sections
    const sectionsResponse = await fetch('http://localhost:3000/api/troubleshooting/sections');
    const sectionsData = await sectionsResponse.json();
    
    console.log('\nAvailable sections:');
    sectionsData.sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title} (${section.id})`);
    });
    console.log(`${sectionsData.sections.length + 1}. Complete guide`);
    
    rl.question('\nSelect a section (1-' + (sectionsData.sections.length + 1) + '): ', async (answer) => {
      const index = parseInt(answer) - 1;
      
      let section = null;
      if (index >= 0 && index < sectionsData.sections.length) {
        section = sectionsData.sections[index].id;
      }
      
      try {
        const response = await fetch('http://localhost:3000/api/troubleshooting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: 'markdown',
            section: section
          })
        });
        
        const data = await response.json();
        console.log('\n' + '='.repeat(50));
        console.log(data.content);
        console.log('='.repeat(50));
        
      } catch (error) {
        console.error('Error fetching content:', error);
      }
      
      rl.close();
    });
    
  } catch (error) {
    console.error('Error connecting to API:', error);
    rl.close();
  }
}

interactiveTroubleshoot();
```

## Example 6: Integration with Automation

### PowerShell Script for Azure DevOps
```powershell
# Azure DevOps pipeline script to fetch troubleshooting guide
param(
    [string]$ApiBaseUrl = "http://localhost:3000",
    [string]$OutputPath = "troubleshooting-output.md"
)

function Get-TroubleshootingGuide {
    param($BaseUrl, $OutputPath)
    
    try {
        $body = @{
            format = "markdown"
            requestId = "azdevops-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/troubleshooting" -Method POST -Body $body -ContentType "application/json"
        
        # Save to file
        $response.content | Out-File -FilePath $OutputPath -Encoding UTF8
        
        Write-Host "✅ Troubleshooting guide saved to: $OutputPath"
        Write-Host "📄 Content length: $($response.metadata.contentLength) characters"
        Write-Host "🕐 Generated at: $($response.timestamp)"
        
        return $true
    }
    catch {
        Write-Error "❌ Failed to fetch troubleshooting guide: $($_.Exception.Message)"
        return $false
    }
}

# Execute
$success = Get-TroubleshootingGuide -BaseUrl $ApiBaseUrl -OutputPath $OutputPath

if ($success) {
    Write-Host "##vso[task.uploaddocs]$OutputPath"
} else {
    Write-Host "##vso[task.logissue type=error]Failed to generate troubleshooting documentation"
    exit 1
}
```

## Example 7: Web Interface Integration

### HTML + JavaScript
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure App Configuration Troubleshooting</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section-btn { margin: 5px; padding: 10px; background: #0078d4; color: white; border: none; cursor: pointer; }
        .content { margin-top: 20px; padding: 20px; border: 1px solid #ddd; background: #f9f9f9; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Azure App Configuration Troubleshooting</h1>
        
        <div id="sections-container">
            <button class="section-btn" onclick="loadContent('complete')">Complete Guide</button>
        </div>
        
        <div id="content-container" class="content">
            <p>Select a section to load the troubleshooting content...</p>
        </div>
    </div>

    <script>
        const API_BASE = 'http://localhost:3000';
        
        async function loadSections() {
            try {
                const response = await fetch(`${API_BASE}/api/troubleshooting/sections`);
                const data = await response.json();
                
                const container = document.getElementById('sections-container');
                data.sections.forEach(section => {
                    const button = document.createElement('button');
                    button.className = 'section-btn';
                    button.textContent = section.title;
                    button.onclick = () => loadContent(section.id);
                    container.appendChild(button);
                });
            } catch (error) {
                console.error('Failed to load sections:', error);
            }
        }
        
        async function loadContent(section) {
            try {
                const response = await fetch(`${API_BASE}/api/troubleshooting`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        format: 'html',
                        section: section === 'complete' ? null : section
                    })
                });
                
                const data = await response.json();
                document.getElementById('content-container').innerHTML = data.content;
            } catch (error) {
                document.getElementById('content-container').innerHTML = 
                    '<p style="color: red;">Failed to load content: ' + error.message + '</p>';
            }
        }
        
        // Load sections on page load
        loadSections();
    </script>
</body>
</html>
```

## Running the Examples

1. **Start the API server**:
   ```bash
   npm start
   ```

2. **Save any example to a file** (e.g., `example.js`, `example.ps1`, `example.py`)

3. **Run the example**:
   ```bash
   node example.js        # For JavaScript
   python example.py      # For Python
   ./example.ps1          # For PowerShell
   ```

## Error Handling

All examples include basic error handling. In production, consider:

- Retry logic for network failures
- Proper logging
- Graceful degradation
- User-friendly error messages

## Security Considerations

When using these examples in production:

- Use HTTPS endpoints
- Implement authentication if required
- Validate and sanitize all inputs
- Consider rate limiting
- Use environment variables for configuration
