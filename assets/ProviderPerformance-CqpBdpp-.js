import{r as t,j as e}from"./index-DRyMwwkr.js";import{P as N}from"./ProviderPageTemplate-DE_zu0kM.js";import{F as o,j as n,a as d,b as l,ao as w,ap as k,aq as S,ar as m,G as v,c as u,B as R,n as z,as as C}from"./index-CbNkEdQY.js";const M=()=>{const[h,g]=t.useState("month"),[j,f]=t.useState("overview"),[a,P]=t.useState({overview:{totalEarnings:285e3,bookings:42,completionRate:94,avgRating:4.7,responseTime:"15m",repeatClients:18,cancellationRate:6,customerSatisfaction:92},trends:{earnings:[{month:"Oct",value:125e3},{month:"Nov",value:185e3},{month:"Dec",value:21e4},{month:"Jan",value:285e3}],bookings:[{month:"Oct",value:8},{month:"Nov",value:12},{month:"Dec",value:15},{month:"Jan",value:7}],ratings:[{month:"Oct",value:4.5},{month:"Nov",value:4.6},{month:"Dec",value:4.7},{month:"Jan",value:4.8}]},comparisons:{vsLastPeriod:{earnings:"+22%",bookings:"+15%",rating:"+0.2",satisfaction:"+5%"},vsPlatformAvg:{earnings:"+45%",bookings:"+28%",rating:"+0.5",satisfaction:"+12%"}}}),[x]=t.useState([{id:1,name:"Deep House Cleaning",bookings:15,revenue:225e3,rating:4.8},{id:2,name:"Office Painting",bookings:8,revenue:32e4,rating:4.7},{id:3,name:"Carpet Cleaning",bookings:7,revenue:98e3,rating:4.9},{id:4,name:"Plumbing Repairs",bookings:6,revenue:75e3,rating:4.6},{id:5,name:"Electrical Wiring",bookings:4,revenue:12e4,rating:4.7}]),[r]=t.useState({topClients:[{id:1,name:"John Doe",bookings:5,totalSpent:75e3,lastBooking:"2024-01-15"},{id:2,name:"Jane Smith",bookings:4,totalSpent:12e4,lastBooking:"2024-01-12"},{id:3,name:"Mike Johnson",bookings:3,totalSpent:45e3,lastBooking:"2024-01-10"},{id:4,name:"Sarah Williams",bookings:3,totalSpent:54e3,lastBooking:"2024-01-08"},{id:5,name:"David Brown",bookings:2,totalSpent:3e4,lastBooking:"2024-01-05"}],repeatRate:42,acquisition:{organic:65,referrals:25,platform:10}}),[b]=t.useState([{id:1,name:"Monthly Earnings",target:3e5,current:285e3,progress:95},{id:2,name:"Customer Rating",target:4.8,current:4.7,progress:98},{id:3,name:"Response Time",target:"10m",current:"15m",progress:67},{id:4,name:"Repeat Clients",target:25,current:18,progress:72}]),p=[{value:"day",label:"Today"},{value:"week",label:"This Week"},{value:"month",label:"This Month"},{value:"quarter",label:"This Quarter"},{value:"year",label:"This Year"}],y=[{id:"overview",label:"Overview",icon:e.jsx(u,{})},{id:"earnings",label:"Earnings",icon:e.jsx(o,{})},{id:"bookings",label:"Bookings",icon:e.jsx(d,{})},{id:"clients",label:"Clients",icon:e.jsx(m,{})},{id:"quality",label:"Quality",icon:e.jsx(l,{})}],i=s=>`₦${s.toLocaleString()}`,c=s=>s.includes("+")?"#4caf50":s.includes("-")?"#f44336":"#666";return e.jsxs(N,{title:"Performance Analytics",subtitle:"Track your business performance and growth",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[e.jsxs("div",{className:"time-range-selector",children:[e.jsx(d,{style:{marginRight:"0.5rem"}}),e.jsx("select",{className:"form-control",value:h,onChange:s=>g(s.target.value),style:{minWidth:"150px"},children:p.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))})]}),e.jsxs("button",{className:"btn-secondary",children:[e.jsx(z,{style:{marginRight:"0.5rem"}}),"Export Report"]}),e.jsxs("button",{className:"btn-secondary",children:[e.jsx(C,{style:{marginRight:"0.5rem"}}),"Settings"]})]}),children:[e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Quick Filters"})}),e.jsx("div",{style:{display:"flex",gap:"0.5rem",flexWrap:"wrap"},children:p.map(s=>e.jsx("button",{className:`time-range-btn ${h===s.value?"active":""}`,onClick:()=>g(s.value),children:s.label},s.value))})]}),e.jsx("div",{className:"metrics-navigation",style:{marginBottom:"2rem"},children:y.map(s=>e.jsxs("button",{className:`metric-category-btn ${j===s.id?"active":""}`,onClick:()=>f(s.id),children:[e.jsx("span",{className:"category-icon",children:s.icon}),e.jsx("span",{className:"category-label",children:s.label})]},s.id))}),e.jsxs("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Total Earnings"}),e.jsx(o,{style:{color:"#4caf50",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"metric-value",children:i(a.overview.totalEarnings)}),e.jsxs("div",{className:"metric-trend",style:{color:c(a.comparisons.vsLastPeriod.earnings)},children:[e.jsx(n,{})," ",a.comparisons.vsLastPeriod.earnings," vs last period"]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Total Bookings"}),e.jsx(d,{style:{color:"#2196f3",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"metric-value",children:a.overview.bookings}),e.jsxs("div",{className:"metric-trend",style:{color:c(a.comparisons.vsLastPeriod.bookings)},children:[e.jsx(n,{})," ",a.comparisons.vsLastPeriod.bookings," vs last period"]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Average Rating"}),e.jsx(l,{style:{color:"#ff9800",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"metric-value",children:[a.overview.avgRating,e.jsx("span",{style:{fontSize:"1rem",color:"#666"},children:"/5.0"})]}),e.jsxs("div",{className:"metric-trend",style:{color:c(a.comparisons.vsLastPeriod.rating)},children:[e.jsx(n,{})," ",a.comparisons.vsLastPeriod.rating," vs last period"]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Completion Rate"}),e.jsx(w,{style:{color:"#9c27b0",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"metric-value",children:[a.overview.completionRate,"%"]}),e.jsxs("div",{className:"metric-trend",children:[e.jsx(n,{})," +2% vs platform average"]})]})]}),e.jsxs("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"provider-card",style:{gridColumn:"span 2"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Earnings Trend"}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("button",{className:"chart-btn active",children:"Monthly"}),e.jsx("button",{className:"chart-btn",children:"Weekly"})]})]}),e.jsx("div",{className:"chart-container",children:e.jsx("div",{className:"chart",children:a.trends.earnings.map((s,q)=>e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar",style:{height:`${s.value/3e5*100}%`,background:`linear-gradient(to top, #4caf50 ${s.value/3e5*100}%, #e8f5e9 0%)`}}),e.jsx("div",{className:"chart-label",children:s.month}),e.jsx("div",{className:"chart-value",children:i(s.value)})]},s.month))})}),e.jsxs("div",{className:"chart-summary",children:[e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Current Month:"}),e.jsx("span",{style:{color:"#4caf50",fontWeight:"600"},children:i(a.trends.earnings[3].value)})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Growth:"}),e.jsx("span",{style:{color:"#4caf50",fontWeight:"600"},children:a.comparisons.vsLastPeriod.earnings})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Platform Avg:"}),e.jsx("span",{children:i(15e4)})]})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Performance Goals"}),e.jsx(k,{style:{color:"#ff9800",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"goals-list",children:b.map(s=>e.jsx("div",{className:"goal-item",children:e.jsxs("div",{className:"goal-info",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0",fontSize:"1rem"},children:s.name}),e.jsxs("div",{className:"goal-progress",children:[e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${s.progress}%`}})}),e.jsxs("div",{className:"goal-stats",children:[e.jsx("span",{className:"current",children:s.current}),e.jsxs("span",{className:"target",children:["/ ",s.target]}),e.jsxs("span",{className:"percentage",children:[s.progress,"%"]})]})]})]})},s.id))}),e.jsx("div",{className:"goals-summary",children:e.jsxs("div",{className:"summary-stats",children:[e.jsxs("div",{className:"stat",children:[e.jsx("strong",{children:"Overall Progress"}),e.jsx("span",{className:"stat-value",children:"83%"})]}),e.jsxs("div",{className:"stat",children:[e.jsx("strong",{children:"Goals Met"}),e.jsx("span",{className:"stat-value",children:"2/4"})]})]})})]})]}),e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Top Performing Services"}),e.jsx(S,{style:{color:"#2196f3",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"top-services-list",children:x.map(s=>e.jsxs("div",{className:"service-item",children:[e.jsxs("div",{className:"service-info",children:[e.jsx("h4",{style:{margin:"0 0 0.3rem 0",fontSize:"1rem"},children:s.name}),e.jsxs("div",{className:"service-stats",children:[e.jsxs("span",{className:"stat",children:[s.bookings," bookings"]}),e.jsx("span",{className:"stat",children:"•"}),e.jsxs("span",{className:"stat",children:["Rating: ",s.rating]})]})]}),e.jsxs("div",{className:"service-revenue",children:[e.jsx("div",{className:"revenue-amount",children:i(s.revenue)}),e.jsxs("div",{className:"revenue-percentage",children:[Math.round(s.revenue/a.overview.totalEarnings*100),"% of total"]})]})]},s.id))}),e.jsxs("div",{className:"services-summary",children:[e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Total Services:"}),e.jsx("span",{children:x.length})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Avg. Booking Value:"}),e.jsx("span",{children:i(Math.round(a.overview.totalEarnings/a.overview.bookings))})]})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Client Insights"}),e.jsx(m,{style:{color:"#9c27b0",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"client-stats",children:[e.jsxs("div",{className:"stat-card",children:[e.jsxs("div",{className:"stat-value",children:[r.repeatRate,"%"]}),e.jsx("div",{className:"stat-label",children:"Repeat Client Rate"})]}),e.jsxs("div",{className:"acquisition-chart",children:[e.jsx("h5",{style:{margin:"0 0 1rem 0"},children:"Client Acquisition"}),e.jsxs("div",{className:"acquisition-bars",children:[e.jsx("div",{className:"acquisition-bar organic",style:{width:`${r.acquisition.organic}%`},children:e.jsxs("span",{children:["Organic: ",r.acquisition.organic,"%"]})}),e.jsx("div",{className:"acquisition-bar referrals",style:{width:`${r.acquisition.referrals}%`},children:e.jsxs("span",{children:["Referrals: ",r.acquisition.referrals,"%"]})}),e.jsx("div",{className:"acquisition-bar platform",style:{width:`${r.acquisition.platform}%`},children:e.jsxs("span",{children:["Platform: ",r.acquisition.platform,"%"]})})]})]})]}),e.jsxs("div",{className:"top-clients",children:[e.jsx("h5",{style:{margin:"0 0 1rem 0"},children:"Top Clients"}),e.jsx("div",{className:"clients-list",children:r.topClients.map(s=>e.jsxs("div",{className:"client-item",children:[e.jsxs("div",{className:"client-info",children:[e.jsx("h6",{style:{margin:"0 0 0.3rem 0"},children:s.name}),e.jsxs("div",{className:"client-meta",children:[e.jsxs("span",{children:[s.bookings," bookings"]}),e.jsx("span",{children:"•"}),e.jsxs("span",{children:["Last: ",s.lastBooking]})]})]}),e.jsx("div",{className:"client-spent",children:e.jsx("div",{className:"spent-amount",children:i(s.totalSpent)})})]},s.id))})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Quality Metrics"}),e.jsx(l,{style:{color:"#ff9800",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"quality-metrics",children:[e.jsxs("div",{className:"metric-item",children:[e.jsxs("div",{className:"metric-header",children:[e.jsx("span",{children:"Response Time"}),e.jsx("span",{className:"metric-value",children:a.overview.responseTime})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${15/30*100}%`,background:"linear-gradient(to right, #4caf50 0%, #8bc34a 100%)"}})}),e.jsxs("div",{className:"metric-comparison",children:[e.jsx(v,{style:{color:"#4caf50"}}),e.jsx("span",{children:"2m faster than last month"})]})]}),e.jsxs("div",{className:"metric-item",children:[e.jsxs("div",{className:"metric-header",children:[e.jsx("span",{children:"Cancellation Rate"}),e.jsxs("span",{className:"metric-value",children:[a.overview.cancellationRate,"%"]})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${a.overview.cancellationRate}%`,background:`linear-gradient(to right, ${a.overview.cancellationRate>10?"#f44336":"#ff9800"} 0%, #ffcc80 100%)`}})}),e.jsxs("div",{className:"metric-comparison",children:[e.jsx(v,{style:{color:"#4caf50"}}),e.jsx("span",{children:"3% lower than platform average"})]})]}),e.jsxs("div",{className:"metric-item",children:[e.jsxs("div",{className:"metric-header",children:[e.jsx("span",{children:"Customer Satisfaction"}),e.jsxs("span",{className:"metric-value",children:[a.overview.customerSatisfaction,"%"]})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${a.overview.customerSatisfaction}%`,background:"linear-gradient(to right, #4caf50 0%, #8bc34a 100%)"}})}),e.jsxs("div",{className:"metric-comparison",children:[e.jsx(n,{style:{color:"#4caf50"}}),e.jsxs("span",{children:[a.comparisons.vsLastPeriod.satisfaction," vs last period"]})]})]}),e.jsxs("div",{className:"metric-item",children:[e.jsxs("div",{className:"metric-header",children:[e.jsx("span",{children:"On-time Completion"}),e.jsxs("span",{className:"metric-value",children:[a.overview.completionRate,"%"]})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${a.overview.completionRate}%`,background:"linear-gradient(to right, #4caf50 0%, #8bc34a 100%)"}})}),e.jsxs("div",{className:"metric-comparison",children:[e.jsx(n,{style:{color:"#4caf50"}}),e.jsx("span",{children:"4% higher than target"})]})]})]})]})]}),e.jsxs("div",{className:"provider-card",style:{marginTop:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Performance Recommendations"}),e.jsx(u,{style:{color:"#1a237e",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"recommendations-grid",children:[e.jsxs("div",{className:"recommendation-card",children:[e.jsx("div",{className:"rec-icon",style:{background:"#e8f5e9"},children:e.jsx(o,{style:{color:"#4caf50"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Increase Service Prices"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Your ratings are 0.5 above average. Consider 10% price increase."})]})]}),e.jsxs("div",{className:"recommendation-card",children:[e.jsx("div",{className:"rec-icon",style:{background:"#e3f2fd"},children:e.jsx(m,{style:{color:"#2196f3"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Focus on Repeat Clients"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Offer 15% discount on next booking to increase repeat rate."})]})]}),e.jsxs("div",{className:"recommendation-card",children:[e.jsx("div",{className:"rec-icon",style:{background:"#fff3e0"},children:e.jsx(R,{style:{color:"#ff9800"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Improve Response Time"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Set up auto-responses to reduce average response time to 10m."})]})]}),e.jsxs("div",{className:"recommendation-card",children:[e.jsx("div",{className:"rec-icon",style:{background:"#f3e5f5"},children:e.jsx(l,{style:{color:"#9c27b0"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Request More Reviews"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Ask satisfied clients for reviews to reach 4.8 average rating."})]})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .time-range-selector {
          display: flex;
          align-items: center;
        }
        
        .time-range-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .time-range-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .time-range-btn:hover:not(.active) {
          border-color: #1a237e;
        }
        
        .metrics-navigation {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .metric-category-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .metric-category-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .metric-category-btn:hover:not(.active) {
          background: #f8f9fa;
          border-color: #1a237e;
        }
        
        .category-icon {
          font-size: 1.2rem;
        }
        
        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a237e;
          margin: 1rem 0;
        }
        
        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .chart-container {
          padding: 1rem 0 2rem;
        }
        
        .chart {
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          height: 200px;
          padding: 0 1rem;
          border-bottom: 1px solid #e0e0e0;
          position: relative;
        }
        
        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        
        .chart-bar {
          width: 40px;
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .chart-bar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .chart-label {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .chart-value {
          font-size: 0.8rem;
          color: #333;
          font-weight: 600;
          margin-top: 0.3rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .chart-bar-container:hover .chart-value {
          opacity: 1;
        }
        
        .chart-summary {
          display: flex;
          justify-content: space-around;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .summary-item strong {
          font-size: 0.9rem;
          color: #666;
        }
        
        .chart-btn {
          padding: 0.3rem 0.8rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .chart-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .goal-progress {
          width: 100%;
        }
        
        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          transition: width 0.3s ease;
        }
        
        .goal-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        
        .goal-stats .current {
          font-weight: 600;
          color: #333;
        }
        
        .goal-stats .target {
          color: #666;
        }
        
        .goal-stats .percentage {
          font-weight: 600;
          color: #4caf50;
        }
        
        .goals-summary {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 1.5rem;
        }
        
        .summary-stats {
          display: flex;
          justify-content: space-around;
        }
        
        .summary-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .summary-stats .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a237e;
          margin-top: 0.5rem;
        }
        
        .top-services-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }
        
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .service-item:hover {
          border-color: #1a237e;
          box-shadow: 0 2px 8px rgba(26, 35, 126, 0.1);
        }
        
        .service-stats {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .service-revenue {
          text-align: right;
        }
        
        .revenue-amount {
          font-weight: 600;
          color: #1a237e;
        }
        
        .revenue-percentage {
          font-size: 0.8rem;
          color: #666;
        }
        
        .services-summary {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        .client-stats {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .stat-card .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #9c27b0;
          margin: 0;
        }
        
        .stat-card .stat-label {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .acquisition-chart {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .acquisition-bars {
          display: flex;
          height: 30px;
          border-radius: 15px;
          overflow: hidden;
        }
        
        .acquisition-bar {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          transition: width 0.3s ease;
        }
        
        .acquisition-bar.organic {
          background: #4caf50;
        }
        
        .acquisition-bar.referrals {
          background: #2196f3;
        }
        
        .acquisition-bar.platform {
          background: #ff9800;
        }
        
        .top-clients {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-top: 1.5rem;
        }
        
        .clients-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .client-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .client-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .spent-amount {
          font-weight: 600;
          color: #1a237e;
        }
        
        .quality-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .metric-item {
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .metric-header .metric-value {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }
        
        .metric-comparison {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
        }
        
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .recommendation-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid #1a237e;
        }
        
        .rec-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        @media (max-width: 1200px) {
          .provider-card[style*="grid-column: span 2"] {
            grid-column: span 1;
          }
          
          .provider-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .metrics-navigation {
            flex-direction: column;
          }
          
          .metric-category-btn {
            justify-content: center;
          }
          
          .chart {
            gap: 1rem;
          }
          
          .chart-bar {
            width: 30px;
          }
          
          .recommendations-grid {
            grid-template-columns: 1fr;
          }
          
          .services-summary,
          .summary-stats {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `})]})};export{M as default};
