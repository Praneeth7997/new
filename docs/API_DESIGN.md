# API Design - Internal Request Management System

## Base URL
```
https://api.company.internal/v1
```

## Authentication
All endpoints require Bearer token authentication via OAuth 2.0

```
Authorization: Bearer {access_token}
```

## Request Management Endpoints

### Create Request
```
POST /requests
Content-Type: application/json

{
  "request_type_id": 1,
  "title": "New Laptop Request",
  "description": "Need MacBook Pro 16\" for development",
  "priority": "high",
  "request_data": {
    "laptop_model": "MacBook Pro 16\"",
    "ram": "32GB",
    "storage": "1TB SSD"
  },
  "attachments": []
}

Response (201 Created):
{
  "id": 12345,
  "request_type_id": 1,
  "requester_id": 789,
  "status": "draft",
  "created_at": "2024-01-15T10:30:00Z",
  "tracking_number": "REQ-2024-001234"
}
```

### Get Request Details
```
GET /requests/:id

Response (200 OK):
{
  "id": 12345,
  "tracking_number": "REQ-2024-001234",
  "request_type": {
    "id": 1,
    "name": "Equipment Request"
  },
  "requester": {
    "id": 789,
    "name": "John Doe",
    "department": "Engineering"
  },
  "title": "New Laptop Request",
  "description": "Need MacBook Pro 16\" for development",
  "priority": "high",
  "status": "pending_approval",
  "request_data": {...},
  "estimated_cost": 2500.00,
  "approvals": [
    {
      "id": 1,
      "approval_level": 1,
      "approver": "Jane Smith",
      "department": "IT",
      "status": "pending",
      "sla_due_date": "2024-01-17T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "approval_level": 2,
      "approver": "Mike Johnson",
      "department": "Finance",
      "status": "pending",
      "sla_due_date": "2024-01-18T10:30:00Z"
    }
  ],
  "comments": [...],
  "attachments": [...],
  "timeline": [...],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

### List Requests
```
GET /requests?status=pending&priority=high&limit=20&offset=0

Query Parameters:
  - status: draft, submitted, approved, rejected, completed, cancelled
  - priority: low, normal, high, urgent
  - department_id: filter by department
  - created_after: ISO 8601 date
  - created_before: ISO 8601 date
  - limit: pagination limit (default 20, max 100)
  - offset: pagination offset (default 0)
  - sort_by: created_at, updated_at, due_date (default: created_at)
  - sort_order: asc, desc (default: desc)

Response (200 OK):
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "pages": 8
  }
}
```

### Submit Request
```
POST /requests/:id/submit

Response (200 OK):
{
  "id": 12345,
  "status": "submitted",
  "submitted_at": "2024-01-15T11:00:00Z",
  "routing_department": "IT",
  "next_approver": "Jane Smith"
}
```

### Update Request
```
PUT /requests/:id
Content-Type: application/json

{
  "title": "Updated Laptop Request",
  "description": "Updated description",
  "priority": "urgent"
}

Response (200 OK): Updated request object
```

### Cancel Request
```
POST /requests/:id/cancel
Content-Type: application/json

{
  "reason": "No longer needed"
}

Response (200 OK):
{
  "id": 12345,
  "status": "cancelled",
  "cancelled_at": "2024-01-15T11:30:00Z"
}
```

## Approval Endpoints

### Get Pending Approvals
```
GET /approvals?status=pending&limit=20

Query Parameters:
  - status: pending, approved, rejected, escalated
  - priority: low, normal, high, urgent
  - department_id: filter by department
  - limit: pagination limit
  - offset: pagination offset
  - sort_by: sla_due_date, created_at (default: sla_due_date)
  - sort_order: asc, desc

Response (200 OK):
{
  "data": [
    {
      "id": 101,
      "request_id": 12345,
      "request": {
        "tracking_number": "REQ-2024-001234",
        "title": "New Laptop Request",
        "requester": "John Doe"
      },
      "approval_level": 1,
      "approver_name": "Jane Smith",
      "department": "IT",
      "priority": "high",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "sla_due_date": "2024-01-17T10:30:00Z",
      "days_pending": 2,
      "is_overdue": false
    }
  ],
  "pagination": {...}
}
```

### Approve Request
```
POST /approvals/:id/approve
Content-Type: application/json

{
  "comments": "Approved. Proceeding with procurement."
}

Response (200 OK):
{
  "id": 101,
  "status": "approved",
  "approved_at": "2024-01-15T14:00:00Z",
  "next_approval": {
    "level": 2,
    "approver": "Mike Johnson",
    "department": "Finance"
  }
}
```

### Reject Request
```
POST /approvals/:id/reject
Content-Type: application/json

{
  "reason": "Budget constraints this quarter",
  "comments": "Please resubmit next quarter"
}

Response (200 OK):
{
  "id": 101,
  "status": "rejected",
  "rejected_at": "2024-01-15T14:15:00Z",
  "notification_sent_to": "john.doe@company.com"
}
```

### Request Information
```
POST /approvals/:id/request-info
Content-Type: application/json

{
  "question": "What is the specific RAM requirement?",
  "priority": "high"
}

Response (201 Created):
{
  "id": 102,
  "approval_id": 101,
  "question": "What is the specific RAM requirement?",
  "asked_by": "Jane Smith",
  "asked_at": "2024-01-15T14:30:00Z",
  "status": "pending_response"
}
```

### Bulk Approve
```
POST /approvals/bulk/approve
Content-Type: application/json

{
  "approval_ids": [101, 102, 103],
  "comments": "Approved in batch"
}

Response (200 OK):
{
  "approved": 3,
  "failed": 0,
  "results": [...]
}
```

## Dashboard & Analytics Endpoints

### Leadership Dashboard Overview
```
GET /dashboard/overview?period=30

Query Parameters:
  - period: 7, 30, 90, 365 (days)

Response (200 OK):
{
  "summary": {
    "total_requests": 450,
    "pending_requests": 45,
    "completed_requests": 380,
    "rejected_requests": 25,
    "avg_completion_time_hours": 48,
    "total_cost": 125000.50
  },
  "sla_metrics": {
    "overall_compliance": 94.5,
    "breached_count": 24,
    "warning_count": 12
  },
  "by_department": [
    {
      "name": "IT",
      "requests": 120,
      "completed": 110,
      "pending": 8,
      "avg_time": 36,
      "sla_compliance": 96.5
    }
  ],
  "request_trend": [
    {
      "date": "2024-01-15",
      "submitted": 25,
      "completed": 20,
      "rejected": 2
    }
  ],
  "top_bottlenecks": [
    {
      "approver": "Jane Smith",
      "pending_count": 15,
      "avg_pending_days": 3.5
    }
  ]
}
```

### Department Performance
```
GET /dashboard/departments/:id/performance?period=30

Response (200 OK):
{
  "department": "IT",
  "period": 30,
  "metrics": {
    "total_requests": 120,
    "completion_rate": 91.7,
    "avg_completion_time": 36,
    "sla_compliance": 96.5,
    "employee_satisfaction": 4.3,
    "cost_spent": 45000,
    "cost_budget": 50000,
    "budget_utilization": 90
  },
  "request_breakdown": {
    "completed": 110,
    "rejected": 5,
    "pending": 5
  },
  "trends": [...],
  "top_requests": [...]
}
```

### SLA Compliance Report
```
GET /dashboard/sla-report?period=30

Response (200 OK):
{
  "period": 30,
  "overall_compliance": 94.5,
  "breached_requests": [
    {
      "id": 12340,
      "tracking_number": "REQ-2024-001230",
      "request_type": "Travel Approval",
      "requester": "John Doe",
      "sla_due_date": "2024-01-14T10:30:00Z",
      "breached_by_hours": 24,
      "current_status": "pending_final_approval",
      "escalated": true
    }
  ],
  "compliance_by_department": [...]
}
```

### Cost Analysis
```
GET /dashboard/cost-analysis?period=30

Response (200 OK):
{
  "period": 30,
  "total_cost": 125000.50,
  "by_category": [
    {
      "category": "Equipment",
      "cost": 45000,
      "count": 18
    },
    {
      "category": "Travel",
      "cost": 35000,
      "count": 45
    }
  ],
  "by_department": [...]
}
```

## Comments & Discussion Endpoints

### Add Comment
```
POST /requests/:id/comments
Content-Type: application/json

{
  "comment": "Please provide more details about the use case",
  "is_internal": false,
  "attachments": []
}

Response (201 Created):
{
  "id": 501,
  "request_id": 12345,
  "author": "Jane Smith",
  "comment": "Please provide more details about the use case",
  "created_at": "2024-01-15T14:45:00Z"
}
```

### Get Comments
```
GET /requests/:id/comments

Response (200 OK):
{
  "data": [...]
}
```

## Notification Endpoints

### Get Notifications
```
GET /notifications?unread=true&limit=20

Query Parameters:
  - unread: true/false
  - limit: pagination limit
  - offset: pagination offset

Response (200 OK):
{
  "data": [
    {
      "id": 1001,
      "type": "approval_reminder",
      "title": "Action Required: Laptop Request Approval",
      "message": "Request REQ-2024-001234 is awaiting your approval",
      "request_id": 12345,
      "read": false,
      "created_at": "2024-01-15T15:00:00Z"
    }
  ]
}
```

### Mark Notification as Read
```
PUT /notifications/:id
Content-Type: application/json

{
  "read": true
}

Response (200 OK)
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid request parameters",
  "details": {
    "priority": "Invalid priority value"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Request not found"
}
```

### 409 Conflict
```json
{
  "error": "conflict",
  "message": "Request cannot be approved as it's already been rejected"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting
- 1000 requests per hour per user
- 10000 requests per hour per API key
- Returns `429 Too Many Requests` when limit exceeded

## Webhooks
- `request.submitted` - When request is submitted
- `request.approved` - When request is approved
- `request.rejected` - When request is rejected
- `approval.pending` - When approval is pending
- `sla.warning` - When SLA is about to breach
- `sla.breached` - When SLA is breached
