// src/modules/dashboard/pages/tenant/TenantMaintenance.jsx
import React, { useState } from 'react'
import { useAuth } from '../../../../shared/context/AuthContext'
import './TenantMaintenance.css'

const TenantMaintenance = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([
    {
      id: 'req_001',
      title: 'AC Repair',
      description: 'AC not cooling properly',
      property: '2 Bedroom Flat, Lekki',
      date: '2024-12-01',
      status: 'in_progress',
      priority: 'high',
      images: []
    }
  ])
  const [showNewRequest, setShowNewRequest] = useState(false)

  const submitRequest = (request) => {
    const newRequest = {
      id: `req_${Date.now()}`,
      ...request,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setRequests([newRequest, ...requests])
    setShowNewRequest(false)
  }

  return (
    <div className="tenant-maintenance">
      <div className="maintenance-header">
        <div>
          <h1>Maintenance Requests</h1>
          <p>Submit and track maintenance requests</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewRequest(true)}
        >
          + New Request
        </button>
      </div>

      {/* Request List */}
      <div className="requests-list">
        {requests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div>
                <h4>{request.title}</h4>
                <p>{request.property}</p>
              </div>
              <span className={`status-badge status-${request.status}`}>
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <p className="request-description">{request.description}</p>
            <div className="request-footer">
              <span className="request-date">Submitted: {request.date}</span>
              <span className={`priority-badge priority-${request.priority}`}>
                {request.priority} priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TenantMaintenance