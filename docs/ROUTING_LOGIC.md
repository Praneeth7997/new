# Intelligent Routing Logic - Internal Request Management System

## Overview

The routing engine automatically determines the primary department and identifies secondary departments that need to be involved in request approvals.

## Department Mapping

```json
{
  "departments": {
    "HR": {
      "id": 1,
      "code": "HR",
      "budget": 500000,
      "head": "Sarah Johnson"
    },
    "Finance": {
      "id": 2,
      "code": "FIN",
      "budget": 1000000,
      "head": "Mike Patel"
    },
    "IT": {
      "id": 3,
      "code": "IT",
      "budget": 750000,
      "head": "Alice Chen"
    },
    "Legal": {
      "id": 4,
      "code": "LEG",
      "budget": 300000,
      "head": "David Brown"
    },
    "Procurement": {
      "id": 5,
      "code": "PROC",
      "budget": 600000,
      "head": "Emma Wilson"
    },
    "Facilities": {
      "id": 6,
      "code": "FAC",
      "budget": 400000,
      "head": "Tom Anderson"
    },
    "Security": {
      "id": 7,
      "code": "SEC",
      "budget": 350000,
      "head": "Rachel Green"
    },
    "Sales": {
      "id": 8,
      "code": "SALES",
      "budget": 1200000,
      "head": "John Richards"
    },
    "Operations": {
      "id": 9,
      "code": "OPS",
      "budget": 800000,
      "head": "Lisa Martinez"
    },
    "Executive": {
      "id": 10,
      "code": "EXEC",
      "budget": 200000,
      "head": "CEO"
    }
  }
}
```

## Request Types & Routing Rules

### 1. HR Onboarding Request
```
Request Type: Onboarding
Primary Department: HR
Secondary Departments: IT, Security, Facilities
SLA: 48 hours

Routing Logic:
- Keywords: "onboard", "new hire", "joining", "induction"
- Trigger: Auto-detected from employee registration system
- Always routes to HR first
- Automatically notifies IT and Security in parallel

Approval Hierarchy:
1. HR Manager (8 hours)
2. HR Head (8 hours)
3. IT Lead (16 hours)
4. Security Lead (8 hours)
5. (Optional) Finance if cost > $5,000
```

### 2. IT Equipment Request
```
Request Type: Equipment Request
Primary Department: IT
Secondary Departments: Finance, Facilities
SLA: 72 hours

Routing Logic:
- Keywords: "laptop", "desktop", "monitor", "keyboard", "mouse", 
            "phone", "software", "license", "equipment"
- Cost threshold: > $500 requires Finance approval
- Inventory check: If item in stock, auto-approve Level 1

Approval Hierarchy:
1. IT Manager (24 hours)
2. IT Head (24 hours)
3. Finance (if cost > $500): Finance Manager (12 hours)
4. (Optional) Executive (if cost > $10,000)

Auto-Approval Rules:
- If cost < $200 and item in stock: Auto-approve Level 1 & 2
- Standard items (peripherals): Auto-approve up to $100
```

### 3. Travel Approval
```
Request Type: Travel Approval
Primary Department: Operations
Secondary Departments: Finance, HR
SLA: 24 hours

Routing Logic:
- Keywords: "travel", "flight", "hotel", "conference", "meeting", "trip"
- Estimated cost affects routing:
  - < $1,000: Operations only
  - $1,000 - $5,000: Operations + Finance
  - > $5,000: Operations + Finance + Executive

Approval Hierarchy:
1. Operations Manager (4 hours)
2. Operations Head (4 hours)
3. Finance Manager (if cost > $1,000): (4 hours)
4. Finance Head (if cost > $3,000): (4 hours)
5. Executive (if cost > $5,000): (2 hours)

Escalation:
- If departure date < 48 hours: Escalate to manager
- If departure date < 24 hours: Escalate to head + executive
```

### 4. Expense Reimbursement
```
Request Type: Expense Reimbursement
Primary Department: Finance
Secondary Departments: HR
SLA: 5 days

Routing Logic:
- Keywords: "reimbursement", "expense", "receipt", "bill", "invoice", "refund"
- Amount determines approval chain
- Receipt validation: Automatic OCR check for duplicate/suspicious entries

Approval Hierarchy:
1. Finance Manager (24 hours)
2. Finance Head (if amount > $1,000): (24 hours)
3. (Optional) HR (for employee-specific policies): (24 hours)
4. (Optional) Executive (if amount > $10,000): (12 hours)

Auto-Approval Rules:
- Amount < $50: Auto-approved (no receipt needed)
- Amount $50-$200: Auto-approved with receipt
- Amount > $200: Requires manual approval
```

### 5. Vendor Procurement Request
```
Request Type: Vendor Procurement
Primary Department: Procurement
Secondary Departments: Finance, Legal
SLA: 7 days

Routing Logic:
- Keywords: "vendor", "supplier", "purchase", "procurement", "contract", "deal"
- New vendor requires Legal review
- Amount determines approval levels
- Existing vendor: Expedited routing

Approval Hierarchy:
1. Procurement Manager (24 hours)
2. Procurement Head (24 hours)
3. Finance Manager (24 hours)
4. Finance Head (if amount > $50,000): (24 hours)
5. Legal (if new vendor): (48 hours)
6. Executive (if amount > $100,000): (12 hours)

Conditions:
- New vendor flag: Automatically routes to Legal
- Standard vendor: Finance approval priority
```

### 6. Contract Review
```
Request Type: Contract Review
Primary Department: Legal
Secondary Departments: Procurement, Finance
SLA: 10 days

Routing Logic:
- Keywords: "contract", "agreement", "terms", "legal review", "NDA", "MOU"
- Contract value affects timeline
- Industry classification affects required reviewers

Approval Hierarchy:
1. Legal Analyst (48 hours)
2. Senior Legal (48 hours)
3. Finance (for financial terms): (24 hours)
4. Procurement (if vendor-related): (24 hours)
5. Executive (if amount > $500,000): (24 hours)

Auto-Escalation:
- Red-flag terms detected: Escalate to senior
- Missing clauses: Route to legal specialist
```

### 7. Facilities Request
```
Request Type: Facilities Issue
Primary Department: Facilities
Secondary Departments: IT, Security
SLA: 48 hours

Routing Logic:
- Keywords: "office issue", "repair", "maintenance", "facilities", 
            "room", "desk", "furniture", "hvac", "lighting"
- Urgency affects SLA
- Location-based routing

Approval Hierarchy (by urgency):
Low Priority (SLA 7 days):
1. Facilities Coordinator (24 hours)
2. Facilities Manager (48 hours)

High Priority/Emergency (SLA 4 hours):
1. Facilities Manager (2 hours)
2. Facilities Head (1 hour)

Security/IT related:
- Auto-include Security if access/network related
- Auto-include IT if technology infrastructure involved
```

### 8. Security Access Request
```
Request Type: Access Card / Security
Primary Department: Security
Secondary Departments: IT, Facilities
SLA: 24 hours

Routing Logic:
- Keywords: "access card", "building access", "key", "security clearance", 
            "badge", "door access", "parking"
- New employee: Auto-routed from HR system
- Elevated access: Requires manager approval

Approval Hierarchy:
1. Security Manager (8 hours)
2. Security Head (8 hours)
3. Building Manager (4 hours)

Conditions:
- New hire: Auto-approved if HR onboarding complete
- Department transfer: Auto-approved by new manager
- Elevated access: Requires executive approval
```

### 9. Sales Discount Approval
```
Request Type: Sales Discount/Approval
Primary Department: Sales
Secondary Departments: Finance, Operations
SLA: 4 hours

Routing Logic:
- Keywords: "discount", "customer discount", "pricing exception", "deal approval"
- Discount tier determines approval chain
- Customer value affects decision speed

Approval Hierarchy:
Tier 1 (Discount < 5%):
1. Sales Manager (1 hour)

Tier 2 (Discount 5-15%):
1. Sales Manager (1 hour)
2. Sales Head (1 hour)
3. Finance Manager (1 hour)

Tier 3 (Discount > 15%):
1. Sales Head (30 mins)
2. Finance Head (30 mins)
3. Operations Head (30 mins)
4. Executive (30 mins)

Auto-Approval Rules:
- Regular customer with good history: Auto-approve up to 5%
- Top-tier customers: Auto-approve up to 10%
- Premium contracts: Auto-approve up to 20%
```

### 10. Executive/Leadership Escalation
```
Request Type: Executive Escalation
Primary Department: Executive Team
Secondary Departments: Operations, Finance
SLA: 2 hours

Routing Logic:
- Keywords: "escalation", "urgent", "crisis", "major decision", "board"
- Triggered manually or by escalation policies
- Highest priority routing

Approval Hierarchy:
1. COO (30 minutes)
2. CEO (30 minutes)

Triggers for Auto-Escalation:
- SLA breach on other request types
- Cost > company threshold
- External customer escalation
- Media/PR risk
- Legal risk
```

## Routing Algorithm

```javascript
async function routeRequest(request) {
  // Step 1: Identify request type
  const requestType = await identifyRequestType(request);
  
  // Step 2: Get routing rules for request type
  const routingRules = await getRoutingRules(requestType.id);
  
  // Step 3: Apply conditional routing
  let primaryDepartment = routingRules.primary_department;
  let secondaryDepartments = [];
  let approvalChain = [];
  
  // Step 4: Check conditions
  for (const rule of routingRules.conditions) {
    if (evaluateCondition(rule, request)) {
      if (rule.action === 'add_department') {
        secondaryDepartments.push(rule.department_id);
      }
      if (rule.action === 'escalate') {
        primaryDepartment = rule.department_id;
      }
      if (rule.action === 'auto_approve') {
        approvalChain.push({ level: rule.level, auto_approved: true });
      }
    }
  }
  
  // Step 5: Build approval chain
  approvalChain = await buildApprovalChain(
    primaryDepartment,
    secondaryDepartments,
    request
  );
  
  // Step 6: Set SLA
  const sla = calculateSLA(requestType, request, approvalChain);
  
  // Step 7: Create routing record
  return {
    primaryDepartment,
    secondaryDepartments,
    approvalChain,
    sla,
    estimatedCompletionDate: sla
  };
}
```

## Routing Conditions

```json
{
  "conditions": [
    {
      "name": "High Cost",
      "condition": { "field": "estimated_cost", "operator": ">", "value": 5000 },
      "actions": [
        { "action": "add_department", "department_id": 2 }
      ]
    },
    {
      "name": "New Vendor",
      "condition": { "field": "is_new_vendor", "operator": "==", "value": true },
      "actions": [
        { "action": "add_department", "department_id": 4 }
      ]
    },
    {
      "name": "Urgent Priority",
      "condition": { "field": "priority", "operator": "==", "value": "urgent" },
      "actions": [
        { "action": "escalate", "department_id": 10 }
      ]
    },
    {
      "name": "Standard Item In Stock",
      "condition": { 
        "field": "request_type", 
        "operator": "==", 
        "value": "equipment",
        "and": { "field": "cost", "operator": "<", "value": 200 }
      },
      "actions": [
        { "action": "auto_approve", "level": 1 },
        { "action": "auto_approve", "level": 2 }
      ]
    }
  ]
}
```

## Escalation Triggers

1. **SLA Approaching** (75% of SLA time): Send reminder to current approver
2. **SLA Breached**: Auto-escalate to manager, notify leadership
3. **High Priority + Overdue**: Skip levels, go directly to head
4. **Cost Threshold Exceeded**: Auto-add Finance or Executive
5. **External Deadline**: Escalate if deadline < 24 hours
6. **Customer Escalation**: Route to Sales Head → Operations → Executive

## Optimization Strategies

- **Parallel Approvals**: Secondary departments approve in parallel
- **Conditional Routing**: Skip unnecessary approvals based on rules
- **Auto-Approvals**: Pre-approved for standard, low-risk requests
- **Load Balancing**: Distribute approvals across available approvers
- **Cache Common Routes**: Store frequently used routing paths
