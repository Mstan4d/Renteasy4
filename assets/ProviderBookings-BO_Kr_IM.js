import{c as V,d as K,b as W,r,j as e,L as M,F as B,f,e as j,H as J,C as X,a as Y}from"./index-DRyMwwkr.js";import{C as Q}from"./circle-alert-BoBdGxpo.js";import{C as P}from"./chevron-left-lczU-naw.js";import{E as ee}from"./ellipsis-vertical-F7F1fajx.js";import{P as se}from"./printer-BX6UbgvK.js";import{D as A}from"./download-Dcw8u_Td.js";import{S as te}from"./square-pen-BPLq0LqC.js";import{D as R}from"./dollar-sign-Dn4pwggx.js";import{C as I}from"./calendar-B_ch62ak.js";import{C as d}from"./clock-xFKoc7JZ.js";import{M as v}from"./message-circle-TOC3mA9G.js";import{P as $}from"./phone-DRU5QaiZ.js";import{M as ae}from"./mail-Bt3p5zaF.js";import{M as re}from"./map-pin-fLuWldOC.js";import{C as L}from"./circle-x-DEX2x_Qk.js";import{C as N}from"./circle-check-big-7dNFP76P.js";const oe=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],ie=V("navigation",oe),ke=()=>{const{id:w}=K(),m=W(),[t,u]=r.useState(null),[q,Z]=r.useState(!0),[o,H]=r.useState("details"),[k,U]=r.useState(!1),[b,g]=r.useState(""),[G,p]=r.useState(!1),[n,h]=r.useState({rating:5,comment:""});r.useEffect(()=>{setTimeout(()=>{u({id:w||"BOOK-789456",bookingNumber:"BK-2024-00123",serviceName:"Deep Cleaning Service",serviceType:"Cleaning",serviceCategory:"Home Services",customer:{id:"CUST-456",name:"Adebayo Johnson",role:"tenant",email:"adebayo.j@example.com",phone:"+2348012345678",avatar:null,rating:4.5,completedBookings:12},property:{id:"PROP-789",address:"24, Allen Avenue, Ikeja, Lagos",type:"3-Bedroom Apartment",size:"1800 sq ft"},dateTime:{scheduled:"2024-01-28T14:00:00Z",requested:"2024-01-20T10:30:00Z",accepted:"2024-01-20T11:15:00Z",completed:null,cancelled:null},pricing:{basePrice:35e3,extraCharges:[{description:"Window Cleaning",amount:5e3},{description:"Furniture Movement",amount:3e3}],discount:2e3,tax:1750,total:40750,paymentMethod:"card",paymentStatus:"paid",paymentId:"PAY-789123456"},status:"scheduled",statusHistory:[{status:"requested",timestamp:"2024-01-20T10:30:00Z",note:"Booking requested by customer"},{status:"accepted",timestamp:"2024-01-20T11:15:00Z",note:"Booking accepted by provider"},{status:"confirmed",timestamp:"2024-01-20T12:00:00Z",note:"Payment received and confirmed"}],notes:"Customer requested eco-friendly cleaning products. Please avoid strong chemicals.",specialInstructions:"Parking available at the back. Bring extra cleaning cloths.",team:[{id:"TM-001",name:"Chika Okafor",role:"Lead Cleaner",phone:"+2348023456789"},{id:"TM-002",name:"Bola Ahmed",role:"Assistant Cleaner",phone:"+2348034567890"}],duration:"4 hours",materialsNeeded:["Eco-friendly detergent","Microfiber cloths","Vacuum cleaner","Mop"],documents:[{id:"DOC-001",name:"Service Agreement.pdf",url:"#",uploaded:"2024-01-20T11:30:00Z"},{id:"DOC-002",name:"Customer Requirements.docx",url:"#",uploaded:"2024-01-20T11:45:00Z"}],messages:[{id:"MSG-001",sender:"customer",text:"Hello, I need deep cleaning for my new apartment",timestamp:"2024-01-20T10:30:00Z"},{id:"MSG-002",sender:"provider",text:"Sure! I can schedule it for next Monday at 2 PM",timestamp:"2024-01-20T10:45:00Z"},{id:"MSG-003",sender:"customer",text:"Perfect! Please use eco-friendly products",timestamp:"2024-01-20T11:00:00Z"}],review:null,cancellationPolicy:{allowed:!0,deadline:"2024-01-27T14:00:00Z",refundPercentage:80},commissionNote:"This booking counts toward your 10 free bookings limit. After 10 bookings, ₦3,000 monthly subscription applies."}),Z(!1)},1e3)},[w]);const O=s=>{const a={requested:{color:"status-badge-yellow",label:"Requested",icon:e.jsx(d,{className:"status-icon"})},accepted:{color:"status-badge-blue",label:"Accepted",icon:e.jsx(N,{className:"status-icon"})},confirmed:{color:"status-badge-green",label:"Confirmed",icon:e.jsx(N,{className:"status-icon"})},scheduled:{color:"status-badge-purple",label:"Scheduled",icon:e.jsx(I,{className:"status-icon"})},in_progress:{color:"status-badge-orange",label:"In Progress",icon:e.jsx(d,{className:"status-icon"})},completed:{color:"status-badge-green",label:"Completed",icon:e.jsx(N,{className:"status-icon"})},cancelled:{color:"status-badge-red",label:"Cancelled",icon:e.jsx(L,{className:"status-icon"})},rejected:{color:"status-badge-gray",label:"Rejected",icon:e.jsx(L,{className:"status-icon"})}},{color:T,label:c,icon:l}=a[s]||a.requested;return e.jsxs("span",{className:`status-badge ${T}`,children:[l,c]})},i=s=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:0}).format(s),y=s=>new Date(s).toLocaleDateString("en-NG",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),C=s=>new Date(s).toLocaleString("en-NG",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),E=s=>{const a=new Date,c=new Date(s)-a;if(c<=0)return"Expired";const l=Math.floor(c/(1e3*60*60*24)),D=Math.floor(c%(1e3*60*60*24)/(1e3*60*60));return l>0?`${l}d ${D}h`:`${D}h`},x=s=>{if(b){const a={...t,status:s,statusHistory:[...t.statusHistory,{status:s,timestamp:new Date().toISOString(),note:b}]};s==="completed"?a.dateTime.completed=new Date().toISOString():s==="cancelled"&&(a.dateTime.cancelled=new Date().toISOString()),u(a),g(""),alert(`Booking status updated to ${s}`)}},S=()=>{m(`/dashboard/provider/messages?booking=${t.id}`)},z=()=>{alert("Invoice download functionality would be implemented here")},F=()=>{const s={...t,review:{...n,timestamp:new Date().toISOString(),reviewer:"provider"}};u(s),p(!1),h({rating:5,comment:""}),alert("Review submitted successfully")},_=()=>{window.print()};return q?e.jsx("div",{className:"provider-bookings-loading",children:e.jsxs("div",{className:"loading-content",children:[e.jsx("div",{className:"loading-spinner"}),e.jsx("p",{className:"loading-text",children:"Loading booking details..."})]})}):t?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"provider-bookings-container",children:e.jsxs("div",{className:"bookings-content",children:[e.jsxs("div",{className:"bookings-header",children:[e.jsxs("div",{className:"header-main",children:[e.jsxs("div",{className:"header-left",children:[e.jsx("button",{onClick:()=>m("/dashboard/provider/bookings"),className:"back-button-icon",children:e.jsx(P,{className:"icon"})}),e.jsxs("div",{children:[e.jsxs("h1",{className:"header-title",children:["Booking #",t.bookingNumber]}),e.jsx("p",{className:"header-subtitle",children:t.serviceName})]})]}),e.jsxs("div",{className:"header-right",children:[O(t.status),e.jsxs("div",{className:"actions-menu",children:[e.jsx("button",{onClick:()=>U(!k),className:"actions-menu-button",children:e.jsx(ee,{className:"icon"})}),k&&e.jsxs("div",{className:"actions-menu-dropdown",children:[e.jsxs("button",{onClick:_,className:"actions-menu-item",children:[e.jsx(se,{className:"item-icon"}),"Print Details"]}),e.jsxs("button",{onClick:z,className:"actions-menu-item",children:[e.jsx(A,{className:"item-icon"}),"Download Invoice"]}),e.jsxs("button",{onClick:()=>m(`/dashboard/provider/bookings/${t.id}/edit`),className:"actions-menu-item",children:[e.jsx(te,{className:"item-icon"}),"Edit Booking"]})]})]})]})]}),e.jsxs("div",{className:"stats-grid",children:[e.jsx("div",{className:"stat-card",children:e.jsxs("div",{className:"stat-card-content",children:[e.jsxs("div",{children:[e.jsx("p",{className:"stat-label",children:"Total Amount"}),e.jsx("p",{className:"stat-value",children:i(t.pricing.total)})]}),e.jsx("div",{className:"stat-icon-container stat-icon-green",children:e.jsx(R,{className:"icon"})})]})}),e.jsx("div",{className:"stat-card",children:e.jsxs("div",{className:"stat-card-content",children:[e.jsxs("div",{children:[e.jsx("p",{className:"stat-label",children:"Scheduled Date"}),e.jsx("p",{className:"stat-value",children:y(t.dateTime.scheduled)})]}),e.jsx("div",{className:"stat-icon-container stat-icon-blue",children:e.jsx(I,{className:"icon"})})]})}),e.jsx("div",{className:"stat-card",children:e.jsxs("div",{className:"stat-card-content",children:[e.jsxs("div",{children:[e.jsx("p",{className:"stat-label",children:"Duration"}),e.jsx("p",{className:"stat-value",children:t.duration})]}),e.jsx("div",{className:"stat-icon-container stat-icon-purple",children:e.jsx(d,{className:"icon"})})]})}),e.jsx("div",{className:"stat-card",children:e.jsxs("div",{className:"stat-card-content",children:[e.jsxs("div",{children:[e.jsx("p",{className:"stat-label",children:"Time Remaining"}),e.jsx("p",{className:"stat-value",children:E(t.dateTime.scheduled)})]}),e.jsx("div",{className:"stat-icon-container stat-icon-orange",children:e.jsx(d,{className:"icon"})})]})})]})]}),e.jsxs("div",{className:"main-grid",children:[e.jsxs("div",{className:"main-left",children:[e.jsxs("div",{className:"tabs-container",children:[e.jsx("div",{className:"tabs-header",children:e.jsx("nav",{className:"tabs-list",children:["details","messages","documents","team","history"].map(s=>e.jsx("button",{onClick:()=>H(s),className:`tab-button ${o===s?"active":""}`,children:s.charAt(0).toUpperCase()+s.slice(1)},s))})}),e.jsxs("div",{className:"tabs-content",children:[o==="details"&&e.jsxs("div",{className:"details-content",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"section-title",children:"Service Details"}),e.jsxs("div",{className:"details-grid",children:[e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Service Type:"}),e.jsx("span",{className:"detail-value",children:t.serviceType})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Category:"}),e.jsx("span",{className:"detail-value",children:t.serviceCategory})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Duration:"}),e.jsx("span",{className:"detail-value",children:t.duration})]})]})]}),e.jsxs("div",{className:"section-divider",children:[e.jsx("h3",{className:"section-title",children:"Customer Instructions"}),e.jsxs("div",{className:"instructions-container",children:[e.jsx("p",{className:"instructions-text",children:t.notes}),t.specialInstructions&&e.jsxs("div",{className:"special-instructions",children:[e.jsx("p",{className:"special-instructions-label",children:"Special Instructions:"}),e.jsx("p",{className:"instructions-text",children:t.specialInstructions})]})]})]}),e.jsxs("div",{className:"section-divider",children:[e.jsx("h3",{className:"section-title",children:"Materials Required"}),e.jsx("div",{className:"materials-grid",children:t.materialsNeeded.map((s,a)=>e.jsx("span",{className:"material-tag",children:s},a))})]})]}),o==="messages"&&e.jsxs("div",{className:"messages-content",children:[e.jsxs("div",{className:"messages-header",children:[e.jsx("h3",{className:"section-title",children:"Booking Messages"}),e.jsxs("button",{onClick:S,className:"send-message-button",children:[e.jsx(v,{className:"button-icon"}),"Send Message"]})]}),e.jsx("div",{className:"messages-list",children:t.messages.map(s=>e.jsx("div",{className:`message-item ${s.sender}`,children:e.jsxs("div",{className:`message-bubble ${s.sender}`,children:[e.jsx("p",{className:"message-text",children:s.text}),e.jsx("p",{className:"message-time",children:C(s.timestamp)})]})},s.id))})]}),o==="documents"&&e.jsxs("div",{className:"documents-content",children:[e.jsx("h3",{className:"section-title",children:"Booking Documents"}),e.jsx("div",{className:"documents-list",children:t.documents.map(s=>e.jsxs("div",{className:"document-item",children:[e.jsxs("div",{className:"document-info",children:[e.jsx(B,{className:"document-icon"}),e.jsxs("div",{children:[e.jsx("p",{className:"document-name",children:s.name}),e.jsxs("p",{className:"document-date",children:["Uploaded: ",y(s.uploaded)]})]})]}),e.jsx("button",{className:"document-download",children:"Download"})]},s.id))}),e.jsxs("button",{className:"upload-document-button",children:[e.jsx(B,{className:"button-icon"}),"Upload New Document"]})]}),o==="team"&&e.jsxs("div",{className:"team-content",children:[e.jsx("h3",{className:"section-title",children:"Assigned Team"}),e.jsx("div",{className:"team-list",children:t.team.map(s=>e.jsxs("div",{className:"team-member",children:[e.jsxs("div",{className:"member-info",children:[e.jsx("div",{className:"member-avatar",children:e.jsx(f,{className:"member-avatar-icon"})}),e.jsxs("div",{className:"member-details",children:[e.jsx("h4",{children:s.name}),e.jsx("p",{children:s.role}),e.jsx("p",{children:s.phone})]})]}),e.jsx("button",{className:"message-member-button",children:e.jsx(v,{className:"icon"})})]},s.id))}),e.jsxs("button",{className:"assign-member-button",children:[e.jsx(f,{className:"button-icon"}),"Assign Team Member"]})]}),o==="history"&&e.jsxs("div",{className:"history-content",children:[e.jsx("h3",{className:"section-title",children:"Status History"}),e.jsx("div",{className:"history-list",children:t.statusHistory.map((s,a)=>e.jsxs("div",{className:"history-item",children:[e.jsx("div",{className:"history-dot"}),e.jsxs("div",{className:"history-content",children:[e.jsxs("div",{className:"history-header",children:[e.jsx("span",{className:"history-status",children:s.status.charAt(0).toUpperCase()+s.status.slice(1)}),e.jsx("span",{className:"history-time",children:C(s.timestamp)})]}),e.jsx("p",{className:"history-note",children:s.note})]})]},a))})]})]})]}),["scheduled","accepted","confirmed"].includes(t.status)&&e.jsxs("div",{className:"status-update-container",children:[e.jsx("h3",{className:"section-title",children:"Update Booking Status"}),e.jsxs("div",{className:"status-update-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Status Note"}),e.jsx("textarea",{value:b,onChange:s=>g(s.target.value),placeholder:"Add notes about the status update...",className:"status-update-textarea",rows:"3"})]}),e.jsxs("div",{className:"status-buttons",children:[t.status==="scheduled"&&e.jsx("button",{onClick:()=>x("in_progress"),className:"status-button start",children:"Start Service"}),t.status==="in_progress"&&e.jsx("button",{onClick:()=>x("completed"),className:"status-button complete",children:"Mark as Completed"}),e.jsx("button",{onClick:()=>x("cancelled"),className:"status-button cancel",children:"Cancel Booking"}),e.jsx("button",{onClick:()=>g(""),className:"status-button clear",children:"Clear"})]})]})]})]}),e.jsxs("div",{className:"main-right",children:[e.jsxs("div",{className:"sidebar-card",children:[e.jsxs("h3",{className:"sidebar-card-title",children:[e.jsx(f,{className:"sidebar-card-title-icon"}),"Customer Details"]}),e.jsxs("div",{className:"customer-content",children:[e.jsxs("div",{className:"customer-info",children:[e.jsx("p",{className:"customer-name",children:t.customer.name}),e.jsxs("div",{className:"customer-meta",children:[e.jsx("span",{className:"customer-role",children:t.customer.role}),e.jsxs("div",{className:"customer-rating",children:[e.jsx(j,{className:"star-icon"}),e.jsx("span",{children:t.customer.rating})]})]})]}),e.jsxs("div",{className:"customer-contact",children:[e.jsxs("div",{className:"contact-item",children:[e.jsx($,{className:"contact-icon"}),e.jsx("a",{href:`tel:${t.customer.phone}`,className:"contact-link",children:t.customer.phone})]}),e.jsxs("div",{className:"contact-item",children:[e.jsx(ae,{className:"contact-icon"}),e.jsx("a",{href:`mailto:${t.customer.email}`,className:"contact-link",children:t.customer.email})]})]}),e.jsx("div",{className:"customer-stats",children:e.jsxs("p",{className:"stats-text",children:["Completed Bookings: ",e.jsx("span",{className:"stats-value",children:t.customer.completedBookings})]})}),e.jsxs("div",{className:"customer-actions",children:[e.jsxs("button",{onClick:S,className:"action-button message",children:[e.jsx(v,{className:"button-icon"}),"Message"]}),e.jsxs("button",{className:"action-button call",children:[e.jsx($,{className:"button-icon"}),"Call"]})]})]})]}),e.jsxs("div",{className:"sidebar-card",children:[e.jsxs("h3",{className:"sidebar-card-title",children:[e.jsx(J,{className:"sidebar-card-title-icon"}),"Property Details"]}),e.jsxs("div",{className:"property-content",children:[e.jsxs("div",{className:"property-address",children:[e.jsx(re,{className:"address-icon"}),e.jsx("p",{className:"address-text",children:t.property.address})]}),e.jsxs("div",{className:"property-details",children:[e.jsxs("div",{className:"property-detail",children:[e.jsx("span",{className:"detail-label",children:"Type:"}),e.jsx("span",{className:"detail-value",children:t.property.type})]}),e.jsxs("div",{className:"property-detail",children:[e.jsx("span",{className:"detail-label",children:"Size:"}),e.jsx("span",{className:"detail-value",children:t.property.size})]})]}),e.jsxs("button",{className:"directions-button",children:[e.jsx(ie,{className:"button-icon"}),"Get Directions"]})]})]}),e.jsxs("div",{className:"sidebar-card",children:[e.jsxs("h3",{className:"sidebar-card-title",children:[e.jsx(R,{className:"sidebar-card-title-icon"}),"Pricing Breakdown"]}),e.jsxs("div",{className:"pricing-content",children:[e.jsxs("div",{className:"pricing-breakdown",children:[e.jsxs("div",{className:"pricing-row",children:[e.jsx("span",{className:"pricing-label",children:"Base Price:"}),e.jsx("span",{className:"pricing-value",children:i(t.pricing.basePrice)})]}),t.pricing.extraCharges.map((s,a)=>e.jsxs("div",{className:"pricing-row",children:[e.jsxs("span",{className:"pricing-label",children:[s.description,":"]}),e.jsx("span",{className:"pricing-value",children:i(s.amount)})]},a)),t.pricing.discount>0&&e.jsxs("div",{className:"pricing-row discount",children:[e.jsx("span",{className:"pricing-label",children:"Discount:"}),e.jsxs("span",{className:"pricing-value",children:["-",i(t.pricing.discount)]})]}),t.pricing.tax>0&&e.jsxs("div",{className:"pricing-row",children:[e.jsx("span",{className:"pricing-label",children:"Tax:"}),e.jsx("span",{className:"pricing-value",children:i(t.pricing.tax)})]})]}),e.jsxs("div",{className:"pricing-total",children:[e.jsx("span",{children:"Total:"}),e.jsx("span",{children:i(t.pricing.total)})]}),e.jsxs("div",{className:"payment-info",children:[e.jsxs("div",{className:"payment-status",children:[e.jsx("span",{className:"payment-label",children:"Payment Status:"}),e.jsx("span",{className:`status-badge-small ${t.pricing.paymentStatus==="paid"?"status-badge-paid":"status-badge-pending"}`,children:t.pricing.paymentStatus})]}),e.jsxs("div",{className:"payment-method",children:[e.jsx("span",{className:"payment-label",children:"Method:"}),e.jsxs("div",{className:"method-info",children:[e.jsx(X,{className:"method-icon"}),e.jsx("span",{className:"method-text",children:t.pricing.paymentMethod})]})]})]})]}),e.jsxs("button",{onClick:z,className:"download-invoice-button",children:[e.jsx(A,{className:"button-icon"}),"Download Invoice"]})]}),e.jsx("div",{className:"commission-note",children:e.jsxs("div",{className:"commission-note-content",children:[e.jsx(Y,{className:"commission-icon"}),e.jsxs("div",{children:[e.jsx("p",{className:"commission-text",children:t.commissionNote}),e.jsx(M,{to:"/dashboard/provider/subscription",className:"commission-link",children:"View subscription details →"})]})]})}),t.status==="completed"&&!t.review&&e.jsxs("div",{className:"review-section",children:[e.jsx("h3",{className:"section-title",children:"Leave a Review"}),e.jsx("p",{className:"review-description",children:"Share your experience working with this customer"}),e.jsxs("button",{onClick:()=>p(!0),className:"review-button",children:[e.jsx(j,{className:"button-icon"}),"Write Review"]})]})]})]})]})}),G&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",children:[e.jsx("div",{className:"modal-header",children:e.jsx("h2",{className:"modal-title",children:"Review Customer"})}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"review-modal-content",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Rating"}),e.jsx("div",{className:"rating-stars",children:[1,2,3,4,5].map(s=>e.jsx("button",{type:"button",onClick:()=>h({...n,rating:s}),className:"rating-star-button",children:e.jsx(j,{className:`rating-star ${s<=n.rating?"active":"inactive"}`})},s))})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Comments"}),e.jsx("textarea",{value:n.comment,onChange:s=>h({...n,comment:s.target.value}),placeholder:"Share your experience working with this customer...",className:"review-textarea",rows:"4"})]}),e.jsxs("div",{className:"modal-actions",children:[e.jsx("button",{onClick:()=>p(!1),className:"modal-button cancel",children:"Cancel"}),e.jsx("button",{onClick:F,className:"modal-button submit",children:"Submit Review"})]})]})})]})}),e.jsx("style",{jsx:!0,children:`
        .provider-bookings-container {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 1rem;
        }
        
        @media (min-width: 768px) {
          .provider-bookings-container {
            padding: 1.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .provider-bookings-container {
            padding: 2rem;
          }
        }
        
        .bookings-content {
          max-width: 120rem;
          margin: 0 auto;
        }
        
        /* Header */
        .bookings-header {
          margin-bottom: 2rem;
        }
        
        .header-main {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .header-main {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .back-button-icon {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .back-button-icon:hover {
          background-color: #f3f4f6;
        }
        
        .back-button-icon .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4b5563;
        }
        
        .header-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }
        
        @media (min-width: 768px) {
          .header-title {
            font-size: 1.875rem;
          }
        }
        
        .header-subtitle {
          color: #6b7280;
          margin-top: 0.25rem;
          font-size: 0.875rem;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-icon {
          width: 1rem;
          height: 1rem;
        }
        
        .status-badge-yellow {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-badge-blue {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .status-badge-green {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-badge-purple {
          background-color: #ede9fe;
          color: #5b21b6;
        }
        
        .status-badge-orange {
          background-color: #ffedd5;
          color: #9a3412;
        }
        
        .status-badge-red {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .status-badge-gray {
          background-color: #f3f4f6;
          color: #374151;
        }
        
        /* Actions Menu */
        .actions-menu {
          position: relative;
        }
        
        .actions-menu-button {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .actions-menu-button:hover {
          background-color: #f3f4f6;
        }
        
        .actions-menu-button .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4b5563;
        }
        
        .actions-menu-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          width: 12rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          z-index: 50;
        }
        
        .actions-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        .actions-menu-item:hover {
          background-color: #f9fafb;
        }
        
        .actions-menu-item .item-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .stat-card {
          background-color: white;
          padding: 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .stat-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }
        
        .stat-icon-container {
          padding: 0.75rem;
          border-radius: 0.5rem;
        }
        
        .stat-icon-container .icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        
        .stat-icon-green {
          background-color: #d1fae5;
        }
        
        .stat-icon-green .icon {
          color: #10b981;
        }
        
        .stat-icon-blue {
          background-color: #dbeafe;
        }
        
        .stat-icon-blue .icon {
          color: #3b82f6;
        }
        
        .stat-icon-purple {
          background-color: #ede9fe;
        }
        
        .stat-icon-purple .icon {
          color: #8b5cf6;
        }
        
        .stat-icon-orange {
          background-color: #ffedd5;
        }
        
        .stat-icon-orange .icon {
          color: #f97316;
        }
        
        /* Main Grid Layout */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 2fr 1fr;
          }
        }
        
        /* Tabs */
        .tabs-container {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .tabs-header {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .tabs-list {
          display: flex;
          overflow-x: auto;
          padding: 0 0.5rem;
        }
        
        .tab-button {
          flex-shrink: 0;
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          color: #374151;
        }
        
        .tab-button.active {
          border-bottom-color: #3b82f6;
          color: #3b82f6;
        }
        
        .tabs-content {
          padding: 1.5rem;
        }
        
        /* Section Styles */
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }
        
        .section-divider {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
          margin-top: 1.5rem;
        }
        
        /* Details Tab */
        .details-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .detail-value {
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
        }
        
        .instructions-container {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .instructions-text {
          color: #374151;
          margin: 0;
          line-height: 1.5;
        }
        
        .special-instructions {
          margin-top: 0.75rem;
        }
        
        .special-instructions-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }
        
        .materials-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .material-tag {
          padding: 0.25rem 0.75rem;
          background-color: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
          font-size: 0.875rem;
        }
        
        /* Messages Tab */
        .messages-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .messages-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .send-message-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .send-message-button:hover {
          background-color: #2563eb;
        }
        
        .send-message-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 24rem;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        
        .message-item {
          display: flex;
        }
        
        .message-item.customer {
          justify-content: flex-start;
        }
        
        .message-item.provider {
          justify-content: flex-end;
        }
        
        .message-bubble {
          max-width: 28rem;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .message-bubble.customer {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .message-bubble.provider {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .message-text {
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
        }
        
        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin: 0;
        }
        
        /* Documents Tab */
        .documents-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .document-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        
        .document-item:hover {
          background-color: #f3f4f6;
        }
        
        .document-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .document-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }
        
        .document-name {
          font-weight: 500;
          color: #111827;
          margin: 0;
          font-size: 0.875rem;
        }
        
        .document-date {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }
        
        .document-download {
          background: none;
          border: none;
          cursor: pointer;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .document-download:hover {
          color: #2563eb;
        }
        
        .upload-document-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s;
          align-self: flex-start;
        }
        
        .upload-document-button:hover {
          background-color: #f9fafb;
        }
        
        .upload-document-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Team Tab */
        .team-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .team-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .team-member {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        
        .member-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .member-avatar {
          width: 3rem;
          height: 3rem;
          background-color: #dbeafe;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .member-avatar-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #3b82f6;
        }
        
        .member-details h4 {
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
        }
        
        .member-details p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.125rem 0;
        }
        
        .message-member-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #3b82f6;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }
        
        .message-member-button:hover {
          background-color: #f3f4f6;
        }
        
        .message-member-button .icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .assign-member-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s;
          align-self: flex-start;
        }
        
        .assign-member-button:hover {
          background-color: #f9fafb;
        }
        
        .assign-member-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* History Tab */
        .history-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .history-dot {
          flex-shrink: 0;
          width: 0.5rem;
          height: 0.5rem;
          background-color: #3b82f6;
          border-radius: 9999px;
          margin-top: 0.5rem;
        }
        
        .history-content {
          flex: 1;
        }
        
        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        
        .history-status {
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
          text-transform: capitalize;
        }
        
        .history-time {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .history-note {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        
        /* Status Update */
        .status-update-container {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .status-update-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .status-update-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.2s;
        }
        
        .status-update-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .status-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .status-button {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .status-button.start {
          background-color: #f97316;
          color: white;
        }
        
        .status-button.start:hover {
          background-color: #ea580c;
        }
        
        .status-button.complete {
          background-color: #10b981;
          color: white;
        }
        
        .status-button.complete:hover {
          background-color: #059669;
        }
        
        .status-button.cancel {
          background-color: #ef4444;
          color: white;
        }
        
        .status-button.cancel:hover {
          background-color: #dc2626;
        }
        
        .status-button.clear {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .status-button.clear:hover {
          background-color: #f9fafb;
        }
        
        /* Sidebar Cards */
        .main-right {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .sidebar-card {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .sidebar-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }
        
        .sidebar-card-title-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4b5563;
        }
        
        /* Customer Card */
        .customer-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .customer-info {
          margin-bottom: 0.5rem;
        }
        
        .customer-name {
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }
        
        .customer-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .customer-role {
          padding: 0.125rem 0.5rem;
          background-color: #dbeafe;
          color: #1d4ed8;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .customer-rating {
          display: flex;
          align-items: center;
          gap: 0.125rem;
        }
        
        .star-icon {
          width: 1rem;
          height: 1rem;
          color: #fbbf24;
          fill: currentColor;
        }
        
        .customer-contact {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .contact-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
          flex-shrink: 0;
        }
        
        .contact-link {
          color: #374151;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        
        .contact-link:hover {
          color: #3b82f6;
        }
        
        .customer-stats {
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .stats-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        
        .stats-value {
          font-weight: 500;
          color: #111827;
        }
        
        .customer-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .action-button {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .action-button.message {
          background-color: #3b82f6;
          color: white;
        }
        
        .action-button.message:hover {
          background-color: #2563eb;
        }
        
        .action-button.call {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .action-button.call:hover {
          background-color: #f9fafb;
        }
        
        .action-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Property Card */
        .property-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .property-address {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .address-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }
        
        .address-text {
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }
        
        .property-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .directions-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .directions-button:hover {
          background-color: #f9fafb;
        }
        
        .directions-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Pricing Card */
        .pricing-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .pricing-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .pricing-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .pricing-value {
          font-weight: 500;
          color: #111827;
          font-size: 0.875rem;
        }
        
        .pricing-row.discount .pricing-value {
          color: #10b981;
        }
        
        .pricing-total {
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.125rem;
          font-weight: bold;
          color: #111827;
        }
        
        .payment-info {
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .payment-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .payment-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .status-badge-small {
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-badge-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .payment-method {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .method-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .method-icon {
          width: 1rem;
          height: 1rem;
          color: #6b7280;
        }
        
        .method-text {
          font-size: 0.875rem;
          color: #111827;
          text-transform: capitalize;
        }
        
        .download-invoice-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          margin-top: 1rem;
        }
        
        .download-invoice-button:hover {
          background-color: #e5e7eb;
        }
        
        .download-invoice-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Commission Note */
        .commission-note {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 0.75rem;
          padding: 1rem;
        }
        
        .commission-note-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .commission-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #d97706;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .commission-text {
          font-size: 0.875rem;
          color: #92400e;
          margin: 0;
          line-height: 1.5;
        }
        
        .commission-link {
          display: inline-block;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #b45309;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .commission-link:hover {
          color: #92400e;
          text-decoration: underline;
        }
        
        /* Review Section */
        .review-section {
          background-color: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .review-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }
        
        .review-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: #3b82f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .review-button:hover {
          background-color: #2563eb;
        }
        
        .review-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Review Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 100;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 1rem;
          max-width: 28rem;
          width: 100%;
        }
        
        .modal-header {
          padding: 1.5rem 1.5rem 0;
        }
        
        .modal-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }
        
        .modal-body {
          padding: 0 1.5rem 1.5rem;
        }
        
        .review-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .rating-stars {
          display: flex;
          gap: 0.25rem;
        }
        
        .rating-star-button {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        
        .rating-star {
          width: 2rem;
          height: 2rem;
        }
        
        .rating-star.active {
          color: #fbbf24;
          fill: currentColor;
        }
        
        .rating-star.inactive {
          color: #d1d5db;
        }
        
        .review-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.2s;
        }
        
        .review-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        
        .modal-button {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .modal-button.cancel {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .modal-button.cancel:hover {
          background-color: #f9fafb;
        }
        
        .modal-button.submit {
          background-color: #3b82f6;
          color: white;
        }
        
        .modal-button.submit:hover {
          background-color: #2563eb;
        }
        
        /* Loading State */
        .provider-bookings-loading {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-content {
          text-align: center;
        }
        
        .loading-spinner {
          width: 4rem;
          height: 4rem;
          border: 4px solid #3b82f6;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        .loading-text {
          color: #4b5563;
          font-size: 1rem;
          margin: 0;
        }
        
        /* Error State */
        .provider-bookings-error {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .error-content {
          text-align: center;
        }
        
        .error-icon {
          width: 4rem;
          height: 4rem;
          color: #9ca3af;
          margin: 0 auto 1rem;
        }
        
        .error-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }
        
        .error-message {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }
        
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .back-button:hover {
          background-color: #2563eb;
        }
        
        .back-button .button-icon {
          width: 1rem;
          height: 1rem;
        }
        
        /* Animations */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Scrollbar Styling */
        .messages-list::-webkit-scrollbar,
        .tabs-list::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .messages-list::-webkit-scrollbar-track,
        .tabs-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .messages-list::-webkit-scrollbar-thumb,
        .tabs-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .messages-list::-webkit-scrollbar-thumb:hover,
        .tabs-list::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        /* Print Styles */
        @media print {
          .provider-bookings-container {
            padding: 0;
            background-color: white;
          }
          
          .header-right,
          .status-update-container,
          .review-section,
          .actions-menu,
          button:not(.print-button) {
            display: none !important;
          }
          
          .main-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card,
          .tabs-container,
          .sidebar-card {
            border: 1px solid #000;
            box-shadow: none;
          }
          
          .header-title {
            color: #000;
          }
        }
        `})]}):e.jsx("div",{className:"provider-bookings-error",children:e.jsxs("div",{className:"error-content",children:[e.jsx(Q,{className:"error-icon"}),e.jsx("h3",{className:"error-title",children:"Booking not found"}),e.jsx("p",{className:"error-message",children:"The requested booking could not be found"}),e.jsxs(M,{to:"/dashboard/provider/bookings",className:"back-button",children:[e.jsx(P,{className:"button-icon"}),"Back to Bookings"]})]})})};export{ke as default};
