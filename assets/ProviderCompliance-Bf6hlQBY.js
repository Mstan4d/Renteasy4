import{r as n,j as e}from"./index-DRyMwwkr.js";import{P as E}from"./ProviderPageTemplate-DE_zu0kM.js";import{h as g,B as c,g as h,ak as F,f as y,q as M,n as j,D as x,al as b,am as A,r as B,an as I,i as U}from"./index-CbNkEdQY.js";const G=()=>{const[s,v]=n.useState([{id:1,title:"Service Provider Agreement",type:"agreement",status:"signed",signedDate:"2024-01-05",expiryDate:"2025-01-05",requirement:"mandatory",description:"Terms and conditions for providing services on RentEasy",actions:["view","download"]},{id:2,title:"Data Protection Policy",type:"policy",status:"pending_review",signedDate:null,expiryDate:null,requirement:"mandatory",description:"GDPR and data handling compliance requirements",actions:["review","sign"]},{id:3,title:"Safety Standards Certification",type:"certification",status:"expired",signedDate:"2023-06-15",expiryDate:"2024-01-15",requirement:"conditional",description:"Required for electrical and plumbing services",actions:["renew","upload"]},{id:4,title:"Insurance Coverage",type:"insurance",status:"valid",signedDate:"2024-01-10",expiryDate:"2025-01-10",requirement:"recommended",description:"Liability insurance for service providers",actions:["view","update"]},{id:5,title:"Tax Compliance Certificate",type:"certificate",status:"not_required",signedDate:null,expiryDate:null,requirement:"conditional",description:"Required for providers with annual earnings above ₦1,000,000",actions:["info"]},{id:6,title:"Code of Conduct",type:"policy",status:"acknowledged",signedDate:"2024-01-05",expiryDate:null,requirement:"mandatory",description:"Professional behavior and ethical guidelines",actions:["view","acknowledge"]}]),[N,$]=n.useState([{id:1,action:"Agreement Signed",item:"Service Provider Agreement",user:"System",timestamp:"2024-01-05 14:30:00",details:"Digital signature applied",status:"completed"},{id:2,action:"Document Uploaded",item:"Safety Standards Certification",user:"You",timestamp:"2024-01-10 09:15:00",details:"Certificate file uploaded",status:"completed"},{id:3,action:"Policy Updated",item:"Data Protection Policy",user:"RentEasy Admin",timestamp:"2024-01-12 11:45:00",details:"Updated to v2.1",status:"pending"},{id:4,action:"Reminder Sent",item:"Safety Standards Certification",user:"System",timestamp:"2024-01-14 16:20:00",details:"Expiry reminder sent",status:"notification"},{id:5,action:"Compliance Check",item:"All Requirements",user:"System",timestamp:"2024-01-15 08:00:00",details:"Monthly compliance audit",status:"completed"}]),[t,w]=n.useState("all"),[k,d]=n.useState(!1),[m,C]=n.useState(null),D=[{id:"all",label:"All Items",count:s.length},{id:"mandatory",label:"Mandatory",count:s.filter(a=>a.requirement==="mandatory").length},{id:"pending",label:"Pending",count:s.filter(a=>a.status.includes("pending")).length},{id:"expired",label:"Expired",count:s.filter(a=>a.status==="expired").length},{id:"valid",label:"Valid",count:s.filter(a=>a.status==="valid"||a.status==="signed").length}],p=a=>{switch(a){case"signed":case"valid":case"acknowledged":return"#4caf50";case"pending_review":case"pending":return"#ff9800";case"expired":return"#f44336";case"not_required":return"#757575";default:return"#666"}},q=a=>{switch(a){case"signed":case"valid":case"acknowledged":return e.jsx(g,{});case"pending_review":case"pending":return e.jsx(c,{});case"expired":return e.jsx(h,{});case"not_required":return e.jsx(U,{});default:return e.jsx(c,{})}},S=a=>{switch(a){case"mandatory":return{label:"Mandatory",color:"#f44336",bg:"#ffebee"};case"conditional":return{label:"Conditional",color:"#ff9800",bg:"#fff3e0"};case"recommended":return{label:"Recommended",color:"#2196f3",bg:"#e3f2fd"};default:return{label:"Optional",color:"#757575",bg:"#f5f5f5"}}},z=a=>{switch(a){case"agreement":return e.jsx(x,{});case"policy":return e.jsx(I,{});case"certification":return e.jsx(b,{});case"insurance":return e.jsx(B,{});case"certificate":return e.jsx(A,{});default:return e.jsx(x,{})}},R=s.filter(a=>t==="all"?!0:t==="mandatory"?a.requirement==="mandatory":t==="pending"?a.status.includes("pending"):t==="expired"?a.status==="expired":t==="valid"?a.status==="valid"||a.status==="signed":!0),f=(a,r)=>{const i=s.find(l=>l.id===a);switch(C(i),r){case"sign":case"review":alert(`Opening ${i.title} for ${r}`);break;case"upload":case"renew":d(!0);break;case"view":alert(`Viewing ${i.title}`);break;case"download":alert(`Downloading ${i.title}`);break;case"acknowledge":v(l=>l.map(u=>u.id===a?{...u,status:"acknowledged",signedDate:new Date().toISOString().split("T")[0]}:u));break}},P=()=>{const a=s.filter(i=>i.requirement==="mandatory"),r=a.filter(i=>i.status==="signed"||i.status==="valid"||i.status==="acknowledged").length;return a.length>0?Math.round(r/a.length*100):100},o=s.filter(a=>{if(!a.expiryDate)return!1;const r=new Date(a.expiryDate),l=Math.ceil((r-new Date)/(1e3*60*60*24));return l>0&&l<=30});return e.jsxs(E,{title:"Compliance & Regulations",subtitle:"Manage your legal and regulatory requirements",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[e.jsxs("button",{className:"btn-secondary",children:[e.jsx(j,{style:{marginRight:"0.5rem"}}),"Export Compliance Report"]}),e.jsxs("button",{className:"btn-primary",children:[e.jsx(b,{style:{marginRight:"0.5rem"}}),"Run Compliance Check"]})]}),children:[e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Compliance Overview"}),e.jsx("div",{className:"compliance-score",children:e.jsxs("div",{className:"score-circle",children:[e.jsxs("span",{className:"score-value",children:[P(),"%"]}),e.jsx("span",{className:"score-label",children:"Compliant"})]})})]}),e.jsxs("div",{className:"compliance-stats",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx(g,{style:{color:"#4caf50",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("div",{className:"stat-value",children:s.filter(a=>a.status==="signed"||a.status==="valid").length}),e.jsx("div",{className:"stat-label",children:"Completed"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx(c,{style:{color:"#ff9800",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("div",{className:"stat-value",children:s.filter(a=>a.status.includes("pending")).length}),e.jsx("div",{className:"stat-label",children:"Pending"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx(h,{style:{color:"#f44336",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("div",{className:"stat-value",children:s.filter(a=>a.status==="expired").length}),e.jsx("div",{className:"stat-label",children:"Expired"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx(F,{style:{color:"#2196f3",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("div",{className:"stat-value",children:o.length}),e.jsx("div",{className:"stat-label",children:"Expiring Soon"})]})]})]}),e.jsxs("div",{className:"compliance-progress",children:[e.jsxs("div",{className:"progress-item",children:[e.jsxs("div",{className:"progress-label",children:[e.jsx("span",{children:"Mandatory Requirements"}),e.jsxs("span",{children:[s.filter(a=>a.requirement==="mandatory"&&(a.status==="signed"||a.status==="valid")).length,"/",s.filter(a=>a.requirement==="mandatory").length]})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${s.filter(a=>a.requirement==="mandatory"&&(a.status==="signed"||a.status==="valid")).length/s.filter(a=>a.requirement==="mandatory").length*100}%`}})})]}),e.jsxs("div",{className:"progress-item",children:[e.jsxs("div",{className:"progress-label",children:[e.jsx("span",{children:"Conditional Requirements"}),e.jsxs("span",{children:[s.filter(a=>a.requirement==="conditional"&&(a.status==="signed"||a.status==="valid")).length,"/",s.filter(a=>a.requirement==="conditional").length]})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill conditional",style:{width:`${s.filter(a=>a.requirement==="conditional"&&(a.status==="signed"||a.status==="valid")).length/s.filter(a=>a.requirement==="conditional").length*100}%`}})})]})]})]}),e.jsx("div",{className:"compliance-filters",style:{marginBottom:"1.5rem"},children:e.jsx("div",{className:"filter-buttons",children:D.map(a=>e.jsxs("button",{className:`filter-btn ${t===a.id?"active":""}`,onClick:()=>w(a.id),children:[a.label,e.jsx("span",{className:"filter-count",children:a.count})]},a.id))})}),e.jsx("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:R.map(a=>{const r=S(a.requirement);return e.jsxs("div",{className:"compliance-item-card",children:[e.jsxs("div",{className:"item-header",children:[e.jsx("div",{className:"item-type-icon",style:{color:p(a.status)},children:z(a.type)}),e.jsxs("div",{className:"item-title-section",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:a.title}),e.jsxs("div",{className:"item-meta",children:[e.jsxs("span",{className:"status-badge",style:{background:p(a.status)+"20",color:p(a.status)},children:[q(a.status),a.status.replace("_"," ")]}),e.jsx("span",{className:"requirement-badge",style:{background:r.bg,color:r.color},children:r.label})]})]})]}),e.jsx("div",{className:"item-description",children:e.jsx("p",{style:{margin:"0 0 1rem 0",color:"#666"},children:a.description})}),e.jsxs("div",{className:"item-details",children:[a.signedDate&&e.jsxs("div",{className:"detail",children:[e.jsx("strong",{children:"Signed:"})," ",a.signedDate]}),a.expiryDate&&e.jsxs("div",{className:"detail",children:[e.jsx("strong",{children:"Expires:"}),e.jsx("span",{style:{color:new Date(a.expiryDate)<new Date?"#f44336":"#4caf50",fontWeight:"600",marginLeft:"0.3rem"},children:a.expiryDate})]})]}),e.jsx("div",{className:"item-actions",children:e.jsx("div",{className:"action-buttons",children:a.actions.map(i=>e.jsx("button",{className:`action-btn ${i}`,onClick:()=>f(a.id,i),children:i.charAt(0).toUpperCase()+i.slice(1)},i))})})]},a.id)})}),o.length>0&&e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsxs("h3",{className:"card-title",children:[e.jsx(y,{style:{marginRight:"0.5rem",color:"#ff9800"}}),"Upcoming Expiries"]}),e.jsxs("span",{className:"expiry-count",children:[o.length," items"]})]}),e.jsx("div",{className:"expiry-list",children:o.map(a=>{const r=Math.ceil((new Date(a.expiryDate)-new Date)/864e5);return e.jsxs("div",{className:"expiry-item",children:[e.jsxs("div",{className:"expiry-info",children:[e.jsx("h5",{style:{margin:"0 0 0.3rem 0"},children:a.title}),e.jsxs("div",{className:"expiry-meta",children:[e.jsxs("span",{children:["Expires: ",a.expiryDate]}),e.jsx("span",{children:"•"}),e.jsxs("span",{className:`days-remaining ${r<=7?"urgent":"warning"}`,children:[r," days remaining"]})]})]}),e.jsx("button",{className:"btn-primary",onClick:()=>f(a.id,"renew"),children:"Renew Now"})]},a.id)})})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsxs("h3",{className:"card-title",children:[e.jsx(M,{style:{marginRight:"0.5rem"}}),"Compliance Audit Log"]}),e.jsxs("button",{className:"btn-secondary",children:[e.jsx(j,{style:{marginRight:"0.5rem"}}),"Export Log"]})]}),e.jsx("div",{className:"audit-log",children:N.map(a=>e.jsxs("div",{className:"log-item",children:[e.jsxs("div",{className:"log-icon",children:[a.status==="completed"&&e.jsx(g,{style:{color:"#4caf50"}}),a.status==="pending"&&e.jsx(c,{style:{color:"#ff9800"}}),a.status==="notification"&&e.jsx(y,{style:{color:"#2196f3"}})]}),e.jsxs("div",{className:"log-content",children:[e.jsxs("div",{className:"log-header",children:[e.jsx("strong",{children:a.action}),e.jsx("span",{className:"log-time",children:a.timestamp})]}),e.jsxs("div",{className:"log-details",children:[e.jsx("span",{className:"log-item-name",children:a.item}),e.jsxs("span",{className:"log-user",children:["by ",a.user]})]}),a.details&&e.jsx("div",{className:"log-description",children:a.details})]})]},a.id))})]}),k&&m&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",style:{maxWidth:"500px"},children:[e.jsxs("div",{className:"modal-header",children:[e.jsxs("h3",{children:["Upload ",m.title]}),e.jsx("button",{className:"modal-close",onClick:()=>d(!1),children:"×"})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"upload-instructions",children:[e.jsxs("p",{children:["Please upload your ",m.title.toLowerCase()," document."]}),e.jsxs("div",{className:"upload-requirements",children:[e.jsx("h4",{children:"Requirements:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"PDF, JPG, or PNG format"}),e.jsx("li",{children:"Maximum file size: 5MB"}),e.jsx("li",{children:"Clear and readable document"}),e.jsx("li",{children:"Valid until at least next month"})]})]}),e.jsx("div",{className:"upload-area",children:e.jsxs("div",{className:"upload-dropzone",children:[e.jsx(x,{style:{fontSize:"3rem",color:"#1a237e",marginBottom:"1rem"}}),e.jsx("p",{style:{margin:"0 0 1rem 0"},children:"Drop your file here or click to browse"}),e.jsx("input",{type:"file",className:"file-input",accept:".pdf,.jpg,.jpeg,.png"}),e.jsx("small",{className:"file-types",children:"PDF, JPG, PNG up to 5MB"})]})}),e.jsxs("div",{className:"upload-meta",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Expiry Date"}),e.jsx("input",{type:"date",className:"form-control"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Document Number (Optional)"}),e.jsx("input",{type:"text",className:"form-control",placeholder:"e.g., CERT-12345"})]})]})]})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn-secondary",onClick:()=>d(!1),children:"Cancel"}),e.jsx("button",{className:"btn-primary",onClick:()=>{d(!1),alert("Document uploaded successfully! It will be reviewed within 24 hours.")},children:"Upload & Submit for Review"})]})]})}),e.jsx("style",{jsx:!0,children:`
        .compliance-score {
          display: flex;
          align-items: center;
        }
        
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
        }
        
        .score-circle::before {
          content: '';
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: white;
          z-index: 1;
        }
        
        .score-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a237e;
          z-index: 2;
          line-height: 1;
        }
        
        .score-label {
          font-size: 0.8rem;
          color: #666;
          z-index: 2;
          margin-top: 0.3rem;
        }
        
        .compliance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .stat-label {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .compliance-progress {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #333;
        }
        
        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          transition: width 0.3s ease;
        }
        
        .progress-fill.conditional {
          background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
        }
        
        .compliance-filters {
          padding: 1rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          padding: 0.8rem 1.5rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .filter-count {
          background: #e0e0e0;
          color: #333;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .filter-btn.active .filter-count {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }
        
        .compliance-item-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .compliance-item-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .item-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .item-type-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }
        
        .item-title-section {
          flex: 1;
        }
        
        .item-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .requirement-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .item-actions {
          margin-top: auto;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .action-btn:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .action-btn.sign {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .action-btn.upload,
        .action-btn.renew {
          background: #4caf50;
          color: white;
          border-color: #4caf50;
        }
        
        .expiry-count {
          background: #ff9800;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .expiry-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .expiry-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #fff3e0;
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        }
        
        .expiry-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
          flex-wrap: wrap;
        }
        
        .days-remaining {
          font-weight: 600;
        }
        
        .days-remaining.urgent {
          color: #f44336;
        }
        
        .days-remaining.warning {
          color: #ff9800;
        }
        
        .audit-log {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1rem 0;
        }
        
        .log-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .log-item:last-child {
          border-bottom: none;
        }
        
        .log-icon {
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }
        
        .log-content {
          flex: 1;
        }
        
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .log-time {
          font-size: 0.8rem;
          color: #666;
        }
        
        .log-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .log-description {
          font-size: 0.9rem;
          color: #666;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 3px solid #1a237e;
        }
        
        .upload-instructions {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .upload-requirements {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .upload-requirements ul {
          margin: 0.5rem 0 0 1.5rem;
          padding: 0;
          color: #666;
        }
        
        .upload-area {
          padding: 2rem;
          border: 2px dashed #ddd;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .upload-area:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .file-input {
          margin: 1rem 0;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 100%;
        }
        
        .file-types {
          color: #666;
          font-size: 0.8rem;
        }
        
        .upload-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .compliance-stats {
            grid-template-columns: 1fr;
          }
          
          .filter-buttons {
            flex-direction: column;
          }
          
          .filter-btn {
            justify-content: center;
          }
          
          .expiry-item {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .upload-meta {
            grid-template-columns: 1fr;
          }
          
          .log-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .log-details {
            flex-direction: column;
            gap: 0.3rem;
          }
        }
      `})]})};export{G as default};
