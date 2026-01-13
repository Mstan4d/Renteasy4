import{r as n,j as e}from"./index-DRyMwwkr.js";import{P as b}from"./ProviderPageTemplate-DE_zu0kM.js";import{y as u,z as v,C as y,R as j,S as N,T as w,U as k,L as C,V as S}from"./index-CbNkEdQY.js";const T=()=>{const[a,i]=n.useState({businessName:"Professional Cleaners NG",tagline:"Professional cleaning services for homes & offices",description:"We provide top-notch cleaning services with eco-friendly products. Serving Lagos for over 5 years with certified professionals and modern equipment. Our team is trained in deep cleaning, sanitization, and maintenance.",categories:["Cleaning","Home Services"],serviceArea:"Lagos, Nigeria",contactPhone:"+2348012345678",contactEmail:"info@cleanersng.com",website:"https://www.cleanersng.com",socialMedia:{facebook:"facebook.com/cleanersng",instagram:"@cleanersng",twitter:"@cleanersng"},operatingHours:{mondayToFriday:"8:00 AM - 6:00 PM",saturday:"9:00 AM - 4:00 PM",sunday:"Emergency Services Only"},servicesOffered:["Deep House Cleaning","Office Cleaning","Carpet Cleaning","Window Cleaning","Post-Construction Cleaning"]}),[o,d]=n.useState("basic"),[s,t]=n.useState(!1),m=()=>{t(!1),alert("Profile saved successfully! Your marketplace profile has been updated.")},p=()=>{alert("Opening preview of your marketplace profile...")},h=()=>{t(!0)},g=()=>{t(!1)},c=()=>{const r=prompt("Enter new service:");r&&r.trim()&&i({...a,servicesOffered:[...a.servicesOffered,r.trim()]})},x=r=>{const l=a.servicesOffered.filter((F,f)=>f!==r);i({...a,servicesOffered:l})};return e.jsxs(b,{title:"Marketplace Profile",subtitle:"This is how you appear in the RentEasy marketplace to tenants, landlords, and estate firms",actions:e.jsx("div",{style:{display:"flex",gap:"0.5rem"},children:s?e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn-secondary",onClick:g,children:"Cancel"}),e.jsxs("button",{className:"btn-primary",onClick:m,style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx(S,{}),"Save Changes"]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn-secondary",onClick:p,style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx(C,{}),"Preview"]}),e.jsx("button",{className:"btn-primary",onClick:h,style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:"Edit Profile"})]})}),children:[e.jsx("div",{className:"tabs-container",style:{marginBottom:"2rem"},children:e.jsx("div",{className:"tabs",children:["basic","contact","services","social"].map(r=>e.jsx("button",{className:`tab-btn ${o===r?"active":""}`,onClick:()=>d(r),children:r.charAt(0).toUpperCase()+r.slice(1)},r))})}),e.jsxs("div",{className:"info-card",style:{marginBottom:"2rem"},children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0",color:"#1a237e"},children:"ⓘ Marketplace Visibility Information"}),e.jsxs("p",{style:{margin:0,color:"#666",fontSize:"0.95rem"},children:["Your profile appears immediately in the RentEasy marketplace.",e.jsx("strong",{children:" Boost"})," improves ranking, ",e.jsx("strong",{children:"verification"})," adds trust badge. This profile is visible to all users searching for services."]})]}),o==="basic"&&e.jsxs("div",{className:"card-grid",children:[e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Business Information"})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Business Name *"}),e.jsx("input",{type:"text",className:"form-control",value:a.businessName,onChange:r=>i({...a,businessName:r.target.value}),disabled:!s,placeholder:"Enter your business name"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Tagline *"}),e.jsx("input",{type:"text",className:"form-control",value:a.tagline,onChange:r=>i({...a,tagline:r.target.value}),disabled:!s,placeholder:"Brief description of your services"}),e.jsx("small",{className:"form-help",children:"This appears below your business name in marketplace"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Description *"}),e.jsx("textarea",{className:"form-control",rows:"6",value:a.description,onChange:r=>i({...a,description:r.target.value}),disabled:!s,placeholder:"Detailed description of your services, experience, and specialties"}),e.jsx("small",{className:"form-help",children:"Minimum 100 characters recommended"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Service Categories"}),e.jsxs("div",{className:"tags-container",children:[a.categories.map((r,l)=>e.jsx("span",{className:"tag",children:r},l)),s&&e.jsx("button",{className:"tag-add",onClick:()=>{const r=prompt("Enter new category:");r&&r.trim()&&i({...a,categories:[...a.categories,r.trim()]})},children:"+ Add"})]})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Preview"})}),e.jsx("div",{className:"card-body",children:e.jsxs("div",{className:"marketplace-preview",children:[e.jsxs("div",{className:"preview-header",children:[e.jsx("div",{className:"preview-avatar",children:"PC"}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.25rem 0"},children:a.businessName}),e.jsx("p",{style:{margin:"0 0 0.5rem 0",color:"#666"},children:a.tagline}),e.jsx("div",{className:"rating-badge",children:"⭐ 4.8 (128 reviews)"})]})]}),e.jsx("div",{className:"preview-description",children:e.jsxs("p",{children:[a.description.substring(0,200),"..."]})}),e.jsx("div",{className:"preview-categories",children:a.categories.map((r,l)=>e.jsx("span",{className:"category-tag",children:r},l))}),e.jsxs("div",{className:"preview-actions",children:[e.jsx("button",{className:"btn-secondary",style:{padding:"0.5rem 1rem"},children:"View Profile"}),e.jsx("button",{className:"btn-primary",style:{padding:"0.5rem 1rem"},children:"Contact Now"})]})]})})]})]}),o==="contact"&&e.jsxs("div",{className:"card-grid",children:[e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Contact Details"})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(u,{style:{marginRight:"0.5rem",color:"#666"}}),"Phone Number *"]}),e.jsx("input",{type:"tel",className:"form-control",value:a.contactPhone,onChange:r=>i({...a,contactPhone:r.target.value}),disabled:!s,placeholder:"+2348012345678"}),e.jsx("small",{className:"form-help",children:"This number will be visible to potential clients"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(v,{style:{marginRight:"0.5rem",color:"#666"}}),"Email Address *"]}),e.jsx("input",{type:"email",className:"form-control",value:a.contactEmail,onChange:r=>i({...a,contactEmail:r.target.value}),disabled:!s,placeholder:"contact@yourbusiness.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(y,{style:{marginRight:"0.5rem",color:"#666"}}),"Service Area *"]}),e.jsx("input",{type:"text",className:"form-control",value:a.serviceArea,onChange:r=>i({...a,serviceArea:r.target.value}),disabled:!s,placeholder:"Cities or areas you serve"}),e.jsx("small",{className:"form-help",children:"Be specific to attract local clients"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Operating Hours"})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Monday - Friday"}),e.jsx("input",{type:"text",className:"form-control",value:a.operatingHours.mondayToFriday,onChange:r=>i({...a,operatingHours:{...a.operatingHours,mondayToFriday:r.target.value}}),disabled:!s})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Saturday"}),e.jsx("input",{type:"text",className:"form-control",value:a.operatingHours.saturday,onChange:r=>i({...a,operatingHours:{...a.operatingHours,saturday:r.target.value}}),disabled:!s})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Sunday & Holidays"}),e.jsx("input",{type:"text",className:"form-control",value:a.operatingHours.sunday,onChange:r=>i({...a,operatingHours:{...a.operatingHours,sunday:r.target.value}}),disabled:!s})]})]})]})]}),o==="services"&&e.jsxs("div",{className:"card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Services Offered"}),s&&e.jsx("button",{className:"btn-secondary",onClick:c,style:{fontSize:"0.9rem"},children:"+ Add Service"})]}),e.jsxs("div",{className:"card-body",children:[a.servicesOffered.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("p",{children:"No services added yet. Add your first service to attract clients."}),s&&e.jsx("button",{className:"btn-primary",onClick:c,children:"Add Your First Service"})]}):e.jsx("div",{className:"services-list",children:a.servicesOffered.map((r,l)=>e.jsxs("div",{className:"service-item",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem"},children:[e.jsx("div",{className:"service-icon",children:"🔧"}),e.jsx("span",{style:{flex:1},children:r})]}),s&&e.jsx("button",{className:"btn-secondary",onClick:()=>x(l),style:{padding:"0.25rem 0.75rem",fontSize:"0.85rem",background:"#ffebee",color:"#c62828",borderColor:"#ffcdd2"},children:"Remove"})]},l))}),e.jsxs("div",{className:"form-group",style:{marginTop:"2rem"},children:[e.jsx("label",{className:"form-label",children:"Service Notes"}),e.jsx("textarea",{className:"form-control",rows:"3",placeholder:"Add any additional information about your services, such as specialties, equipment used, or certifications...",disabled:!s})]})]})]}),o==="social"&&e.jsxs("div",{className:"card-grid",children:[e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Website & Social Media"})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(j,{style:{marginRight:"0.5rem",color:"#666"}}),"Website"]}),e.jsx("input",{type:"url",className:"form-control",value:a.website,onChange:r=>i({...a,website:r.target.value}),disabled:!s,placeholder:"https://www.yourwebsite.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(N,{style:{marginRight:"0.5rem",color:"#1877F2"}}),"Facebook"]}),e.jsx("input",{type:"text",className:"form-control",value:a.socialMedia.facebook,onChange:r=>i({...a,socialMedia:{...a.socialMedia,facebook:r.target.value}}),disabled:!s,placeholder:"facebook.com/yourpage"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(w,{style:{marginRight:"0.5rem",color:"#E4405F"}}),"Instagram"]}),e.jsx("input",{type:"text",className:"form-control",value:a.socialMedia.instagram,onChange:r=>i({...a,socialMedia:{...a.socialMedia,instagram:r.target.value}}),disabled:!s,placeholder:"@yourusername"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"form-label",children:[e.jsx(k,{style:{marginRight:"0.5rem",color:"#1DA1F2"}}),"Twitter/X"]}),e.jsx("input",{type:"text",className:"form-control",value:a.socialMedia.twitter,onChange:r=>i({...a,socialMedia:{...a.socialMedia,twitter:r.target.value}}),disabled:!s,placeholder:"@yourusername"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Social Media Tips"})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsxs("div",{className:"tip-card",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0",fontSize:"0.95rem"},children:"✅ Add Social Proof"}),e.jsx("p",{style:{margin:0,fontSize:"0.9rem",color:"#666"},children:"Links to your social profiles add credibility and help clients learn more about your work."})]}),e.jsxs("div",{className:"tip-card",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0",fontSize:"0.95rem"},children:"✅ Showcase Your Work"}),e.jsx("p",{style:{margin:0,fontSize:"0.9rem",color:"#666"},children:"Use Instagram/Facebook to showcase before/after photos and client testimonials."})]}),e.jsxs("div",{className:"tip-card",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0",fontSize:"0.95rem"},children:"✅ Build Trust"}),e.jsx("p",{style:{margin:0,fontSize:"0.9rem",color:"#666"},children:"Active social media presence shows you're an established, professional service provider."})]})]}),e.jsx("div",{style:{marginTop:"2rem",padding:"1rem",background:"#E3F2FD",borderRadius:"8px",borderLeft:"4px solid #2196F3"},children:e.jsxs("p",{style:{margin:0,fontSize:"0.9rem",color:"#1565C0"},children:[e.jsx("strong",{children:"Note:"})," Social media links are optional but recommended. They help improve your marketplace ranking and client trust."]})})]})]})]}),e.jsxs("div",{className:"info-card",style:{marginTop:"2rem"},children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0",color:"#1a237e"},children:"🎯 Marketplace Best Practices"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"1rem"},children:[e.jsxs("div",{children:[e.jsx("strong",{style:{color:"#4CAF50"},children:"Complete Profile"}),e.jsx("p",{style:{margin:"0.25rem 0 0 0",fontSize:"0.9rem",color:"#666"},children:"Fill all sections for better visibility"})]}),e.jsxs("div",{children:[e.jsx("strong",{style:{color:"#2196F3"},children:"Clear Photos"}),e.jsx("p",{style:{margin:"0.25rem 0 0 0",fontSize:"0.9rem",color:"#666"},children:"Add high-quality photos of your work"})]}),e.jsxs("div",{children:[e.jsx("strong",{style:{color:"#9C27B0"},children:"Quick Responses"}),e.jsx("p",{style:{margin:"0.25rem 0 0 0",fontSize:"0.9rem",color:"#666"},children:"Respond to inquiries within 24 hours"})]}),e.jsxs("div",{children:[e.jsx("strong",{style:{color:"#FF9800"},children:"Encourage Reviews"}),e.jsx("p",{style:{margin:"0.25rem 0 0 0",fontSize:"0.9rem",color:"#666"},children:"Ask satisfied clients to leave reviews"})]})]})]}),e.jsx("style",{jsx:!0,children:`
        /* Tabs */
        .tabs-container {
          border-bottom: 1px solid #e0e0e0;
        }
        
        .tabs {
          display: flex;
          overflow-x: auto;
          gap: 0;
        }
        
        .tab-btn {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          border-bottom: 3px solid transparent;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s ease;
        }
        
        .tab-btn:hover {
          color: #1a237e;
          background: #f5f5f5;
        }
        
        .tab-btn.active {
          color: #1a237e;
          border-bottom-color: #1a237e;
          font-weight: 600;
        }
        
        /* Cards */
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
        }
        
        .card-title {
          margin: 0;
          font-size: 1.1rem;
          color: #1a237e;
        }
        
        .card-body {
          padding: 1.5rem;
        }
        
        /* Forms */
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }
        
        .form-control:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        
        .form-help {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #666;
        }
        
        /* Tags */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .tag {
          padding: 0.4rem 0.8rem;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .tag-add {
          padding: 0.4rem 0.8rem;
          background: transparent;
          color: #1a237e;
          border: 1px dashed #1a237e;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tag-add:hover {
          background: #1a237e;
          color: white;
        }
        
        /* Marketplace Preview */
        .marketplace-preview {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          background: #f8f9fa;
        }
        
        .preview-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .preview-avatar {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .rating-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #fff3e0;
          color: #ef6c00;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .preview-description {
          margin-bottom: 1.5rem;
          color: #666;
          line-height: 1.6;
        }
        
        .preview-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .category-tag {
          padding: 0.3rem 0.7rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #666;
        }
        
        .preview-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        /* Services List */
        .services-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          background: #f8f9fa;
        }
        
        .service-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #e3f2fd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        /* Info Cards */
        .info-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          border-left: 4px solid #1a237e;
        }
        
        .tip-card {
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        /* Buttons */
        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 0.95rem;
        }
        
        .btn-primary {
          background: #1a237e;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0d145c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
        }
        
        .btn-secondary {
          background: white;
          color: #1a237e;
          border: 1px solid #1a237e;
        }
        
        .btn-secondary:hover {
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
          
          .tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
          }
          
          .tab-btn {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .preview-header {
            flex-direction: column;
            text-align: center;
          }
          
          .preview-avatar {
            align-self: center;
          }
          
          .preview-actions {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .card-body {
            padding: 1rem;
          }
          
          .form-control {
            padding: 0.6rem 0.8rem;
          }
          
          .btn-primary, .btn-secondary {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }
      `})]})};export{T as default};
