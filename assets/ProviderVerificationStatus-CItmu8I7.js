import{r as l,j as e}from"./index-DRyMwwkr.js";import{P as U}from"./ProviderPageTemplate-DE_zu0kM.js";import{d as v,I as N,B as i,h as o,r as x,J as w,q as k,K as f,g as c,L as z,n as V,M as F,N as _,i as q}from"./index-CbNkEdQY.js";const H=()=>{const[a,P]=l.useState({overall:"pending",submittedDate:"2024-01-10",reviewDate:null,verifiedDate:null,rejectionReason:null,verificationLevel:2,nextReviewDate:"2024-04-10"}),[n,b]=l.useState([{id:1,type:"government_id",name:"National ID Card",status:"verified",uploadedDate:"2024-01-10",verifiedDate:"2024-01-12",fileUrl:"#",previewUrl:"#",notes:"Front and back uploaded"},{id:2,type:"proof_of_address",name:"Utility Bill",status:"pending",uploadedDate:"2024-01-10",verifiedDate:null,fileUrl:"#",previewUrl:"#",notes:"Electricity bill - January 2024"},{id:3,type:"business_registration",name:"Business Registration",status:"rejected",uploadedDate:"2024-01-05",verifiedDate:"2024-01-08",fileUrl:"#",previewUrl:"#",notes:"Certificate expired, please upload updated certificate",rejectionReason:"Document expired"},{id:4,type:"tax_certificate",name:"Tax Clearance Certificate",status:"not_uploaded",uploadedDate:null,verifiedDate:null,fileUrl:null,previewUrl:null,notes:"Required for full verification"},{id:5,type:"portfolio_samples",name:"Portfolio Samples",status:"verified",uploadedDate:"2024-01-08",verifiedDate:"2024-01-11",fileUrl:"#",previewUrl:"#",notes:"5 project photos uploaded"}]),[g]=l.useState([{id:1,requirement:"Government Issued ID",mandatory:!0,status:"completed"},{id:2,requirement:"Proof of Address",mandatory:!0,status:"pending"},{id:3,requirement:"Business Registration",mandatory:!1,status:"rejected"},{id:4,requirement:"Tax Clearance Certificate",mandatory:!1,status:"not_started"},{id:5,requirement:"Portfolio Samples (min. 3)",mandatory:!0,status:"completed"},{id:6,requirement:"Professional Certifications",mandatory:!1,status:"not_started"},{id:7,requirement:"Client References",mandatory:!1,status:"not_started"},{id:8,requirement:"Bank Account Verification",mandatory:!0,status:"in_progress"}]),[d,h]=l.useState("status"),[T,B]=l.useState(null),[m,p]=l.useState(null),[I,A]=l.useState(!1),y=s=>{switch(s){case"verified":return e.jsx(o,{});case"pending":return e.jsx(i,{});case"rejected":return e.jsx(q,{});case"in_review":return e.jsx(i,{});case"not_uploaded":return e.jsx(c,{});default:return e.jsx(c,{})}},D=()=>{switch(a.overall){case"verified":return"Verified Provider";case"pending":return"Verification Pending";case"rejected":return"Verification Rejected";case"in_review":return"Under Review";default:return"Not Started"}},u=()=>{const s=g.filter(t=>t.status==="completed").length;return Math.round(s/g.length*100)},S=s=>{p({type:s}),setTimeout(()=>{const t={id:n.length+1,type:s,name:n.find(r=>r.type===s)?.name||"New Document",status:"pending",uploadedDate:new Date().toISOString().split("T")[0],verifiedDate:null,fileUrl:"#",previewUrl:"#",notes:"Uploaded for verification"};b([...n.filter(r=>r.type!==s),t]),p(null),alert("Document uploaded successfully! It will be reviewed within 24-48 hours.")},1500)},R=s=>{const t=n.find(r=>r.id===s);t&&(p({type:t.type}),setTimeout(()=>{b(r=>r.map(j=>j.id===s?{...j,status:"pending",uploadedDate:new Date().toISOString().split("T")[0]}:j)),p(null),alert("Document resubmitted for review")},1500))},C=["Verified badge on your profile","Higher ranking in search results","Increased client trust","Access to premium features","Priority customer support","Verified provider badge in marketplace"];return e.jsxs(U,{title:"Verification Status",subtitle:"Complete your KYC to become a verified provider",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem"},children:[e.jsxs("button",{className:"btn-secondary",children:[e.jsx(k,{style:{marginRight:"0.5rem"}}),"View History"]}),e.jsxs("button",{className:"btn-primary",children:[e.jsx(f,{style:{marginRight:"0.5rem"}}),"Upload Documents"]})]}),children:[e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Verification Overview"}),e.jsxs("div",{className:`status-badge ${a.overall}`,children:[y(a.overall),e.jsx("span",{children:D()})]})]}),e.jsxs("div",{className:"verification-overview",children:[e.jsxs("div",{className:"overview-stats",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx(v,{style:{color:"#1a237e",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsxs("div",{className:"stat-value",children:[a.verificationLevel,"/5"]}),e.jsx("div",{className:"stat-label",children:"Verification Level"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx(N,{style:{color:"#1a237e",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsxs("div",{className:"stat-value",children:[n.filter(s=>s.status==="verified").length,"/",n.length]}),e.jsx("div",{className:"stat-label",children:"Documents Verified"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx(i,{style:{color:"#1a237e",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsxs("div",{className:"stat-value",children:[u(),"%"]}),e.jsx("div",{className:"stat-label",children:"Progress Complete"})]})]})]}),e.jsxs("div",{className:"progress-section",children:[e.jsxs("div",{className:"progress-header",children:[e.jsx("h4",{children:"Verification Progress"}),e.jsxs("span",{children:[u(),"% Complete"]})]}),e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${u()}%`}})}),e.jsx("div",{className:"progress-steps",children:["Submitted","Documents","Review","Approval","Verified"].map((s,t)=>{const r=Math.min(Math.max(u()-t*20,0),20);return e.jsxs("div",{className:"progress-step",children:[e.jsx("div",{className:`step-indicator ${r>0?"active":""}`,children:r===20?e.jsx(o,{}):t+1}),e.jsx("div",{className:"step-label",children:s}),e.jsx("div",{className:"step-progress",children:e.jsx("div",{className:"step-progress-fill",style:{width:`${r/20*100}%`}})})]},s)})})]}),e.jsxs("div",{className:"benefits-section",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Benefits of Verification"}),e.jsx("div",{className:"benefits-grid",children:C.map((s,t)=>e.jsxs("div",{className:"benefit-item",children:[e.jsx(o,{style:{color:"#4caf50"}}),e.jsx("span",{children:s})]},t))})]})]})]}),e.jsxs("div",{className:"tabs-navigation",style:{marginBottom:"1.5rem"},children:[e.jsxs("button",{className:`tab-btn ${d==="status"?"active":""}`,onClick:()=>h("status"),children:[e.jsx(x,{})," Status & Requirements"]}),e.jsxs("button",{className:`tab-btn ${d==="documents"?"active":""}`,onClick:()=>h("documents"),children:[e.jsx(w,{})," Documents"]}),e.jsxs("button",{className:`tab-btn ${d==="history"?"active":""}`,onClick:()=>h("history"),children:[e.jsx(k,{})," Activity History"]})]}),d==="status"&&e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Verification Requirements"}),e.jsx("p",{className:"card-subtitle",children:"Complete all requirements to get verified"})]}),e.jsx("div",{className:"requirements-list",children:g.map(s=>e.jsxs("div",{className:"requirement-item",children:[e.jsxs("div",{className:"requirement-info",children:[e.jsx("div",{className:"requirement-checkbox",children:e.jsx("input",{type:"checkbox",checked:s.status==="completed",readOnly:!0})}),e.jsxs("div",{children:[e.jsxs("h4",{style:{margin:"0 0 0.3rem 0"},children:[s.requirement,s.mandatory&&e.jsx("span",{className:"mandatory-badge",children:"Required"})]}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:s.status==="completed"?"Verified and approved":s.status==="pending"?"Under review":s.status==="rejected"?"Needs resubmission":s.status==="in_progress"?"Processing...":"Not yet submitted"})]})]}),e.jsxs("div",{className:"requirement-status",children:[e.jsx("span",{className:`status-indicator ${s.status}`,children:s.status.replace("_"," ")}),s.status==="rejected"&&e.jsx("button",{className:"btn-secondary",style:{fontSize:"0.9rem"},children:"Resubmit"}),s.status==="not_started"&&e.jsx("button",{className:"btn-primary",style:{fontSize:"0.9rem"},children:"Start"})]})]},s.id))}),e.jsxs("div",{className:"next-steps",style:{marginTop:"2rem",paddingTop:"1.5rem",borderTop:"1px solid #e0e0e0"},children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Next Steps"}),e.jsxs("div",{className:"steps-grid",children:[e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:e.jsx(f,{})}),e.jsx("h5",{children:"Upload Missing Documents"}),e.jsx("p",{style:{color:"#666",fontSize:"0.9rem"},children:"Complete your document submission"}),e.jsx("button",{className:"btn-primary",style:{width:"100%"},children:"Upload Now"})]}),e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:e.jsx(i,{})}),e.jsx("h5",{children:"Wait for Review"}),e.jsx("p",{style:{color:"#666",fontSize:"0.9rem"},children:"Typically takes 24-48 hours"}),e.jsxs("div",{className:"step-meta",children:[e.jsx(i,{})," Next review: ",a.nextReviewDate]})]}),e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:e.jsx(v,{})}),e.jsx("h5",{children:"Get Verified Badge"}),e.jsx("p",{style:{color:"#666",fontSize:"0.9rem"},children:"Start enjoying verified benefits"}),e.jsxs("div",{className:"step-meta",children:[e.jsx(x,{})," Level ",a.verificationLevel]})]})]})]})]}),d==="documents"&&e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Document Management"}),e.jsx("p",{className:"card-subtitle",children:"Upload and manage your verification documents"})]}),e.jsx("div",{className:"documents-grid",children:n.map(s=>e.jsxs("div",{className:"document-card",children:[e.jsxs("div",{className:"document-header",children:[e.jsx("div",{className:"document-icon",children:e.jsx(w,{})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.3rem 0"},children:s.name}),e.jsxs("div",{className:"document-meta",children:[e.jsxs("span",{className:`status-badge ${s.status}`,children:[y(s.status),s.status.replace("_"," ")]}),s.uploadedDate&&e.jsxs("span",{className:"upload-date",children:["Uploaded: ",s.uploadedDate]})]})]})]}),e.jsxs("div",{className:"document-info",children:[s.notes&&e.jsx("p",{style:{margin:"0 0 1rem 0",color:"#666",fontSize:"0.9rem"},children:s.notes}),s.rejectionReason&&s.status==="rejected"&&e.jsxs("div",{className:"rejection-notice",children:[e.jsx(c,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"Rejection Reason:"}),e.jsx("p",{style:{margin:"0.3rem 0 0",color:"#f44336"},children:s.rejectionReason})]})]})]}),e.jsx("div",{className:"document-actions",children:s.status==="not_uploaded"?e.jsx("button",{className:"btn-primary",onClick:()=>S(s.type),disabled:m?.type===s.type,children:m?.type===s.type?e.jsxs(e.Fragment,{children:[e.jsx(i,{style:{marginRight:"0.5rem"}}),"Uploading..."]}):e.jsxs(e.Fragment,{children:[e.jsx(f,{style:{marginRight:"0.5rem"}}),"Upload Document"]})}):e.jsxs("div",{style:{display:"flex",gap:"0.5rem",flexWrap:"wrap"},children:[s.fileUrl&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn-secondary",children:[e.jsx(z,{style:{marginRight:"0.3rem"}}),"Preview"]}),e.jsxs("button",{className:"btn-secondary",children:[e.jsx(V,{style:{marginRight:"0.3rem"}}),"Download"]})]}),s.status==="rejected"&&e.jsx("button",{className:"btn-primary",onClick:()=>R(s.id),disabled:m?.type===s.type,children:m?.type===s.type?"Resubmitting...":"Resubmit"}),s.status==="pending"&&e.jsxs("button",{className:"btn-secondary",disabled:!0,children:[e.jsx(i,{style:{marginRight:"0.3rem"}}),"Under Review"]}),s.status==="verified"&&e.jsxs("button",{className:"btn-secondary",disabled:!0,children:[e.jsx(o,{style:{marginRight:"0.3rem",color:"#4caf50"}}),"Verified"]})]})})]},s.id))}),e.jsxs("div",{className:"guidelines-section",style:{marginTop:"2rem",paddingTop:"1.5rem",borderTop:"1px solid #e0e0e0"},children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Document Guidelines"}),e.jsxs("div",{className:"guidelines-grid",children:[e.jsxs("div",{className:"guideline",children:[e.jsx(F,{}),e.jsxs("div",{children:[e.jsx("h5",{style:{margin:"0 0 0.5rem 0"},children:"Clear Photos"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Ensure all text is readable and photo is well-lit"})]})]}),e.jsxs("div",{className:"guideline",children:[e.jsx(N,{}),e.jsxs("div",{children:[e.jsx("h5",{style:{margin:"0 0 0.5rem 0"},children:"Valid Documents"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Documents must be current and not expired"})]})]}),e.jsxs("div",{className:"guideline",children:[e.jsx(_,{}),e.jsxs("div",{children:[e.jsx("h5",{style:{margin:"0 0 0.5rem 0"},children:"Complete Information"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"All required fields must be filled and visible"})]})]}),e.jsxs("div",{className:"guideline",children:[e.jsx(x,{}),e.jsxs("div",{children:[e.jsx("h5",{style:{margin:"0 0 0.5rem 0"},children:"Security"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Your documents are securely stored and encrypted"})]})]})]})]})]}),d==="history"&&e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Verification Activity"}),e.jsx("p",{className:"card-subtitle",children:"History of your verification process"})]}),e.jsxs("div",{className:"activity-timeline",children:[e.jsxs("div",{className:"timeline-item completed",children:[e.jsx("div",{className:"timeline-marker",children:e.jsx(o,{})}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Profile Setup Completed"}),e.jsx("p",{style:{margin:"0 0 0.5rem 0",color:"#666"},children:"Your provider profile was created with basic information"}),e.jsxs("div",{className:"timeline-meta",children:[e.jsx(i,{})," ",a.submittedDate," • Completed"]})]})]}),e.jsxs("div",{className:"timeline-item completed",children:[e.jsx("div",{className:"timeline-marker",children:e.jsx(f,{})}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Initial Documents Submitted"}),e.jsx("p",{style:{margin:"0 0 0.5rem 0",color:"#666"},children:"Government ID and portfolio samples uploaded"}),e.jsxs("div",{className:"timeline-meta",children:[e.jsx(i,{})," 2024-01-10 • Completed"]})]})]}),e.jsxs("div",{className:"timeline-item in-progress",children:[e.jsx("div",{className:"timeline-marker",children:e.jsx(i,{})}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Document Review Started"}),e.jsx("p",{style:{margin:"0 0 0.5rem 0",color:"#666"},children:"Your documents are being reviewed by the verification team"}),e.jsxs("div",{className:"timeline-meta",children:[e.jsx(i,{})," 2024-01-11 • In Progress"]})]})]}),e.jsxs("div",{className:"timeline-item pending",children:[e.jsx("div",{className:"timeline-marker",children:e.jsx(c,{})}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Additional Documents Requested"}),e.jsx("p",{style:{margin:"0 0 0.5rem 0",color:"#666"},children:"Business registration certificate needs to be updated"}),e.jsxs("div",{className:"timeline-meta",children:[e.jsx(i,{})," 2024-01-12 • Action Required"]})]})]}),e.jsxs("div",{className:"timeline-item future",children:[e.jsx("div",{className:"timeline-marker",children:e.jsx(v,{})}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Verification Completion"}),e.jsx("p",{style:{margin:"0 0 0.5rem 0",color:"#666"},children:"Estimated completion date for full verification"}),e.jsxs("div",{className:"timeline-meta",children:[e.jsx(i,{})," ",a.nextReviewDate," • Pending"]})]})]})]})]}),e.jsxs("div",{className:"provider-card",style:{marginTop:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Need Help?"})}),e.jsxs("div",{className:"support-grid",children:[e.jsxs("div",{className:"support-item",children:[e.jsx(c,{style:{color:"#ff9800",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Document Issues"}),e.jsx("p",{style:{margin:0,color:"#666"},children:"Having trouble uploading documents or getting rejected?"}),e.jsx("button",{className:"btn-secondary",style:{marginTop:"1rem"},children:"Get Help"})]})]}),e.jsxs("div",{className:"support-item",children:[e.jsx(i,{style:{color:"#2196f3",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Review Time"}),e.jsx("p",{style:{margin:0,color:"#666"},children:"Want to know how long verification takes?"}),e.jsx("button",{className:"btn-secondary",style:{marginTop:"1rem"},children:"Check Status"})]})]}),e.jsxs("div",{className:"support-item",children:[e.jsx(x,{style:{color:"#4caf50",fontSize:"2rem"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Verification Benefits"}),e.jsx("p",{style:{margin:0,color:"#666"},children:"Learn more about verified provider benefits"}),e.jsx("button",{className:"btn-secondary",style:{marginTop:"1rem"},children:"Learn More"})]})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .status-badge.verified {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.pending {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        .status-badge.rejected {
          background: #ffebee;
          color: #c62828;
        }
        
        .status-badge.in_review {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .verification-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
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
        
        .progress-section {
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .progress-bar {
          height: 10px;
          background: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          transition: width 0.3s ease;
        }
        
        .progress-steps {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #666;
          transition: all 0.3s ease;
        }
        
        .step-indicator.active {
          background: #4caf50;
          color: white;
        }
        
        .step-label {
          font-size: 0.9rem;
          color: #666;
          text-align: center;
        }
        
        .step-progress {
          width: 100%;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .step-progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }
        
        .benefits-section {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }
        
        .tabs-navigation {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .tab-btn {
          padding: 1rem 1.5rem;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }
        
        .tab-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .tab-btn:hover:not(.active) {
          background: #f8f9fa;
          border-color: #1a237e;
        }
        
        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .requirement-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .requirement-item:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .requirement-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }
        
        .requirement-checkbox input {
          width: 20px;
          height: 20px;
          margin-top: 0.3rem;
        }
        
        .mandatory-badge {
          background: #ffebee;
          color: #c62828;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }
        
        .requirement-status {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .status-indicator {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .status-indicator.completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-indicator.pending {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        .status-indicator.rejected {
          background: #ffebee;
          color: #c62828;
        }
        
        .status-indicator.in_progress {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .status-indicator.not_started {
          background: #f5f5f5;
          color: #757575;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .step-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .step-icon {
          width: 60px;
          height: 60px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .step-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .document-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .document-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .document-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .document-icon {
          width: 50px;
          height: 50px;
          background: #e8f0fe;
          color: #1a237e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .document-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .upload-date {
          font-size: 0.8rem;
          color: #666;
        }
        
        .rejection-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 1rem;
          background: #ffebee;
          border-radius: 8px;
          border-left: 4px solid #f44336;
        }
        
        .rejection-notice svg {
          color: #f44336;
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }
        
        .guidelines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .guideline {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .guideline svg {
          color: #1a237e;
          font-size: 1.5rem;
          margin-top: 0.2rem;
        }
        
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          padding-left: 2rem;
        }
        
        .activity-timeline::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e0e0e0;
        }
        
        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }
        
        .timeline-marker {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e0e0e0;
          position: absolute;
          left: -2rem;
          z-index: 1;
        }
        
        .timeline-item.completed .timeline-marker {
          border-color: #4caf50;
          color: #4caf50;
        }
        
        .timeline-item.in-progress .timeline-marker {
          border-color: #2196f3;
          color: #2196f3;
          animation: pulse 2s infinite;
        }
        
        .timeline-item.pending .timeline-marker {
          border-color: #ff9800;
          color: #ff9800;
        }
        
        .timeline-item.future .timeline-marker {
          border-color: #757575;
          color: #757575;
        }
        
        .timeline-content {
          flex: 1;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #e0e0e0;
        }
        
        .timeline-item.completed .timeline-content {
          border-left-color: #4caf50;
        }
        
        .timeline-item.in-progress .timeline-content {
          border-left-color: #2196f3;
        }
        
        .timeline-item.pending .timeline-content {
          border-left-color: #ff9800;
        }
        
        .timeline-item.future .timeline-content {
          border-left-color: #757575;
        }
        
        .timeline-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .support-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .support-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .overview-stats {
            grid-template-columns: 1fr;
          }
          
          .progress-steps {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .progress-step {
            align-items: flex-start;
            flex-direction: row;
            gap: 1rem;
          }
          
          .step-progress {
            display: none;
          }
          
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          
          .documents-grid {
            grid-template-columns: 1fr;
          }
          
          .steps-grid {
            grid-template-columns: 1fr;
          }
          
          .guidelines-grid {
            grid-template-columns: 1fr;
          }
          
          .support-grid {
            grid-template-columns: 1fr;
          }
          
          .tabs-navigation {
            flex-direction: column;
          }
          
          .tab-btn {
            justify-content: center;
          }
          
          .requirement-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .requirement-status {
            width: 100%;
            justify-content: space-between;
          }
        }
      `})]})};export{H as default};
