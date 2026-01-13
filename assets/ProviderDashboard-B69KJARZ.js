import{r as i,j as e}from"./index-DRyMwwkr.js";import{P as p}from"./ProviderPageTemplate-DE_zu0kM.js";import{F as h,a as n,b as g,c as x,d as t,e as v,f}from"./index-CbNkEdQY.js";const k=()=>{const[a,l]=i.useState({totalEarnings:0,pendingBookings:0,completedJobs:0,averageRating:0,responseRate:"0%",upcomingJobs:0,leadsThisMonth:0,conversionRate:"0%"}),[c,j]=i.useState([{id:1,client:"John Doe",service:"House Cleaning",date:"2024-01-15",status:"Upcoming",amount:"₦15,000"},{id:2,client:"Jane Smith",service:"Painting",date:"2024-01-14",status:"Completed",amount:"₦45,000"},{id:3,client:"Mike Johnson",service:"Plumbing",date:"2024-01-12",status:"In Progress",amount:"₦25,000"}]),[o,u]=i.useState([{id:1,message:"New booking request from Sarah",time:"2 hours ago",type:"booking"},{id:2,message:"Your service has been reviewed",time:"1 day ago",type:"review"},{id:3,message:"Payment received ₦15,000",time:"2 days ago",type:"payment"}]);i.useEffect(()=>{l({totalEarnings:125e3,pendingBookings:3,completedJobs:24,averageRating:4.7,responseRate:"95%",upcomingJobs:5,leadsThisMonth:12,conversionRate:"42%"})},[]);const d=[{title:"Total Earnings",value:`₦${a.totalEarnings.toLocaleString()}`,icon:e.jsx(h,{}),color:"linear-gradient(135deg, #00c853 0%, #64dd17 100%)",change:"+12%"},{title:"Pending Bookings",value:a.pendingBookings,icon:e.jsx(n,{}),color:"linear-gradient(135deg, #ff9800 0%, #ff5722 100%)",change:"+3"},{title:"Avg. Rating",value:a.averageRating,icon:e.jsx(g,{}),color:"linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%)",change:"+0.2"},{title:"Response Rate",value:a.responseRate,icon:e.jsx(x,{}),color:"linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)",change:"+5%"}],m=[{label:"Post New Service",path:"/dashboard/provider/post-service",icon:e.jsx(v,{})},{label:"Check Messages",path:"/dashboard/provider/messages",icon:e.jsx(f,{})},{label:"Update Availability",path:"/dashboard/provider/availability",icon:e.jsx(n,{})},{label:"Get Verified",path:"/dashboard/provider/verify",icon:e.jsx(t,{})}];return e.jsxs(p,{title:"Provider Dashboard",subtitle:"Welcome back! Here's your business overview",children:[e.jsx("div",{className:"provider-grid provider-grid-4",style:{marginBottom:"2rem"},children:d.map((s,r)=>e.jsxs("div",{className:"provider-card stats-card",style:{background:s.color},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:s.title}),e.jsx("span",{style:{fontSize:"1.5rem",color:"white"},children:s.icon})]}),e.jsx("div",{className:"stats-number",children:s.value}),e.jsx("div",{className:"stats-label",children:e.jsxs("span",{style:{color:"rgba(255,255,255,0.9)"},children:[s.change," from last month"]})})]},r))}),e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"provider-card",style:{gridColumn:"span 2"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Recent Bookings"}),e.jsx("button",{className:"btn-secondary",onClick:()=>window.location.href="/dashboard/provider/bookings",children:"View All"})]}),e.jsxs("div",{className:"provider-table",children:[e.jsx("div",{className:"table-header",children:e.jsxs("div",{className:"provider-grid provider-grid-5",children:[e.jsx("div",{children:"Client"}),e.jsx("div",{children:"Service"}),e.jsx("div",{children:"Date"}),e.jsx("div",{children:"Status"}),e.jsx("div",{children:"Amount"})]})}),c.map(s=>e.jsx("div",{className:"table-row",children:e.jsxs("div",{className:"provider-grid provider-grid-5",children:[e.jsx("div",{className:"table-cell",children:s.client}),e.jsx("div",{className:"table-cell",children:s.service}),e.jsx("div",{className:"table-cell",children:s.date}),e.jsx("div",{className:"table-cell",children:e.jsx("span",{className:`status-badge status-${s.status.toLowerCase().replace(" ","")}`,children:s.status})}),e.jsx("div",{className:"table-cell",style:{fontWeight:"600"},children:s.amount})]})},s.id))]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Quick Actions"})}),e.jsx("div",{className:"quick-actions-grid",children:m.map((s,r)=>e.jsxs("button",{className:"quick-action-btn",onClick:()=>window.location.href=s.path,children:[e.jsx("span",{className:"action-icon",children:s.icon}),e.jsx("span",{className:"action-label",children:s.label})]},r))}),e.jsxs("div",{style:{marginTop:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Recent Notifications"})}),e.jsx("div",{className:"notifications-list",children:o.map(s=>e.jsxs("div",{className:"notification-item",children:[e.jsxs("div",{className:"notification-icon",children:[s.type==="booking"&&"📅",s.type==="review"&&"⭐",s.type==="payment"&&"💰"]}),e.jsxs("div",{className:"notification-content",children:[e.jsx("p",{className:"notification-message",children:s.message}),e.jsx("span",{className:"notification-time",children:s.time})]})]},s.id))})]})]})]}),e.jsxs("div",{className:"provider-grid",style:{marginTop:"2rem"},children:[e.jsxs("div",{className:"provider-card",children:[e.jsx("h3",{className:"card-title",children:"Performance Overview"}),e.jsxs("div",{className:"performance-stats",children:[e.jsxs("div",{className:"performance-item",children:[e.jsx("span",{className:"performance-label",children:"Completed Jobs"}),e.jsx("span",{className:"performance-value",children:a.completedJobs})]}),e.jsxs("div",{className:"performance-item",children:[e.jsx("span",{className:"performance-label",children:"Upcoming Jobs"}),e.jsx("span",{className:"performance-value",children:a.upcomingJobs})]}),e.jsxs("div",{className:"performance-item",children:[e.jsx("span",{className:"performance-label",children:"Leads This Month"}),e.jsx("span",{className:"performance-value",children:a.leadsThisMonth})]}),e.jsxs("div",{className:"performance-item",children:[e.jsx("span",{className:"performance-label",children:"Conversion Rate"}),e.jsx("span",{className:"performance-value",children:a.conversionRate})]})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsx("h3",{className:"card-title",children:"Verification Status"}),e.jsxs("div",{className:"verification-status",children:[e.jsxs("div",{className:"verification-item",children:[e.jsx(t,{style:{color:"#4caf50",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Profile Verified"}),e.jsx("p",{style:{color:"#666",margin:0},children:"Your profile is 80% complete"})]})]}),e.jsx("button",{className:"btn-primary",style:{marginTop:"1rem"},children:"Complete Verification"})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsx("h3",{className:"card-title",children:"Subscription Status"}),e.jsxs("div",{className:"subscription-status",children:[e.jsxs("div",{className:"subscription-info",children:[e.jsxs("p",{style:{margin:"0 0 1rem 0"},children:[e.jsx("strong",{children:"Status:"})," ",e.jsx("span",{className:"status-active",children:"Active"})]}),e.jsxs("p",{style:{margin:"0 0 1rem 0"},children:[e.jsx("strong",{children:"Plan:"})," Free Tier (5 bookings left)"]}),e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Next Billing:"})," After 5 more bookings"]})]}),e.jsx("button",{className:"btn-secondary",style:{marginTop:"1rem"},children:"Upgrade Plan"})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .provider-grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .quick-actions-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, 1fr);
        }
        
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .quick-action-btn:hover {
          background: #e9ecef;
          border-color: #1a237e;
          transform: translateY(-2px);
        }
        
        .action-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #1a237e;
        }
        
        .action-label {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #1a237e;
        }
        
        .notification-icon {
          font-size: 1.2rem;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-message {
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }
        
        .notification-time {
          font-size: 0.8rem;
          color: #666;
        }
        
        .performance-stats {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(2, 1fr);
        }
        
        .performance-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .performance-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .performance-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .verification-item, .subscription-info {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .verification-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        @media (max-width: 1200px) {
          .provider-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .provider-grid-4,
          .provider-grid-2 {
            grid-template-columns: 1fr;
          }
          
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
          
          .performance-stats {
            grid-template-columns: 1fr;
          }
        }
      `})]})};export{k as default};
