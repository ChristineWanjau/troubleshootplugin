# Azure App Configuration - Feature Flag Creator Troubleshooting Guide

## Overview
This document provides guidance on how to identify who created feature flags in Azure App Configuration, as this information is not directly available in the portal.

## Problem Statement
Azure App Configuration portal does not display information about who created a specific feature flag. Users frequently request this functionality for auditing and accountability purposes.

## Recommended Solution

### Azure Monitor Integration
Azure App Configuration integrates with Azure Monitor to collect monitoring data including metrics and logs. This data can provide insights into operations performed on your App Configuration store.

### AACHttpRequest Table
The `AACHttpRequest` table monitors entries of every HTTP request sent to your App Configuration resource. While it doesn't directly show feature flag creators, it provides valuable operational information.

## Implementation Steps

### 1. Enable Monitoring for Azure App Configuration

1. Navigate to your Azure App Configuration resource in the Azure portal
2. Go to **Monitoring** > **Diagnostic settings**
3. Click **Add diagnostic setting**
4. Configure the following:
   - **Name**: Give your diagnostic setting a descriptive name
   - **Categories**: Select **HTTP requests** (this populates the AACHttpRequest table)
   - **Destination**: Choose your preferred destination:
     - Log Analytics workspace (recommended)
     - Storage account
     - Event hub

### 2. Query the AACHttpRequest Table

Use the following KQL (Kusto Query Language) queries in Log Analytics to identify potential feature flag creators:

#### Basic Query - All HTTP Requests
```kusto
AACHttpRequest
| where TimeGenerated >= ago(30d)
| project TimeGenerated, ClientIp, UserAgent, Method, RequestUri, StatusCode
| order by TimeGenerated desc
```

#### Filter for Feature Flag Operations
```kusto
AACHttpRequest
| where TimeGenerated >= ago(30d)
| where RequestUri contains "kv" and Method == "PUT"
| project TimeGenerated, ClientIp, UserAgent, Method, RequestUri, StatusCode
| order by TimeGenerated desc
```

#### Identify Unique Users by IP and User Agent
```kusto
AACHttpRequest
| where TimeGenerated >= ago(30d)
| where RequestUri contains "kv" and Method == "PUT"
| summarize Count = count(), FirstSeen = min(TimeGenerated), LastSeen = max(TimeGenerated) by ClientIp, UserAgent
| order by Count desc
```

### 3. Analyzing the Data

#### Key Fields to Monitor:
- **ClientIp**: The IP address of the client making the request
- **UserAgent**: Information about the client application or browser
- **TimeGenerated**: When the request was made
- **Method**: HTTP method (PUT for creating/updating feature flags)
- **RequestUri**: The specific resource being accessed
- **StatusCode**: HTTP response status

#### Identifying Feature Flag Creation:
- Look for `PUT` requests to URIs containing `/kv/`
- Cross-reference the timestamp with when you know the feature flag was created
- Use ClientIp and UserAgent to identify potential users

### 4. Best Practices for Tracking

#### Implement Consistent Naming Conventions
- Use descriptive feature flag names that include team or user identifiers
- Example: `teamA_newLoginFlow_enabled`

#### Use Tags and Labels
- Leverage Azure App Configuration labels to include creator information
- Example labels: `createdBy:john.doe`, `team:frontend`

#### Document Changes
- Maintain an external log of feature flag changes
- Use Azure DevOps work items or similar tracking systems

## Advanced Monitoring Setup

### Custom Alerts
Create alerts for feature flag modifications:

```kusto
AACHttpRequest
| where Method in ("PUT", "DELETE") and RequestUri contains "kv"
| where StatusCode == 200
```

### PowerBI Dashboard
Create visualizations showing:
- Feature flag creation trends
- Most active IP addresses
- User agent patterns

## Limitations

1. **Privacy Considerations**: IP addresses may not directly identify individual users
2. **Shared IPs**: Multiple users may share the same public IP
3. **Automation**: Automated systems may create flags without human identification
4. **Data Retention**: Monitor logs have retention limits

## Alternative Solutions

### 1. Azure Resource Manager Template Tracking
- Deploy feature flags via ARM templates
- Track deployments through Azure Activity Log

### 2. API-Based Tracking
- Use a custom wrapper API that logs creator information
- Implement authentication to capture user identity

### 3. CI/CD Pipeline Integration
- Track feature flag changes through your deployment pipeline
- Use pipeline metadata to identify creators

## Troubleshooting Common Issues

### No Data in AACHttpRequest Table
- Verify diagnostic settings are properly configured
- Check that HTTP requests category is enabled
- Ensure sufficient time has passed for data to appear (up to 15 minutes)

### Missing Creator Information
- Cross-reference with Azure Activity Log
- Check application deployment logs
- Review CI/CD pipeline history

### Performance Impact
- Monitor costs associated with Log Analytics ingestion
- Set appropriate data retention policies
- Use sampling if request volume is very high

## Support Resources

- [Monitor Azure App Configuration | Microsoft Learn](https://docs.microsoft.com/en-us/azure/azure-app-configuration/howto-monitor)
- [Azure Monitor Logs | Microsoft Learn](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/)
- [KQL Quick Reference | Microsoft Learn](https://docs.microsoft.com/en-us/azure/data-explorer/kql-quick-reference)

## Contact Information

For additional support or questions about this troubleshooting guide, please contact the Azure Support Team.

---
*Last Updated: August 8, 2025*
*Version: 1.0*
