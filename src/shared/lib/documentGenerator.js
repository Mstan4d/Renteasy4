// src/shared/lib/documentGenerator.js
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { supabase } from './supabaseClient';

// Safely set up fonts – different versions of pdfmake have different structures
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs;
} else {
  console.warn('pdfmake vfs fonts not found – PDF generation may fail');
}

export const documentGenerator = {
  /**
   * Generate a rent receipt PDF, upload to storage, and create estate_document record.
   * Returns the created document record (including id, file_url, etc.)
   */
  async generateReceipt(payment) {
    // Validate input
    if (!payment || !payment.unit) {
      throw new Error('Invalid payment data');
    }

    const { unit, amount, payment_date, id } = payment;
    const property = unit.property;
    const tenant = unit.tenant;

    // Define PDF document structure
    const docDefinition = {
      content: [
        { text: 'RENT RECEIPT', style: 'header' },
        { text: `Receipt No: ${id ? id.slice(0, 8) : 'N/A'}`, alignment: 'right' },
        { text: '\n' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Property: ', bold: true },
                `${property?.name || 'N/A'}\n`,
                { text: 'Unit: ', bold: true },
                `${unit.unit_number || 'N/A'}\n`,
                { text: 'Tenant: ', bold: true },
                `${tenant?.name || 'N/A'}\n`,
              ]
            },
            {
              width: '50%',
              text: [
                { text: 'Date: ', bold: true },
                `${payment_date ? new Date(payment_date).toLocaleDateString() : 'N/A'}\n`,
                { text: 'Amount: ', bold: true },
                { text: `₦${amount ? amount.toLocaleString() : '0'}`, fontSize: 14, bold: true },
              ],
              alignment: 'right'
            }
          ]
        },
        { text: '\n\n' },
        { text: 'Payment Details', style: 'subheader' },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Payment Date', payment_date ? new Date(payment_date).toLocaleDateString() : 'N/A'],
              ['Amount', `₦${amount ? amount.toLocaleString() : '0'}`],
              ['Payment Method', 'Bank Transfer / Offline'],
              ['Status', 'Paid'],
            ]
          }
        },
        { text: '\n\n' },
        { text: 'This is a computer‑generated receipt. No signature required.', italics: true, fontSize: 10 }
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    // Generate PDF as blob
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBlob(async (blob) => {
          try {
            // Upload to Supabase Storage
            const fileName = `receipts/${payment.id || Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
              .from('estate-documents')
              .upload(fileName, blob, { contentType: 'application/pdf' });
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('estate-documents')
              .getPublicUrl(fileName);

            // Create estate_document record
            const { data: doc, error: docError } = await supabase
              .from('estate_documents')
              .insert({
                estate_firm_id: property?.estate_firm_id || null,
                name: `Rent Receipt - ${unit.unit_number || 'Unit'} - ${payment_date || ''}`,
                file_url: urlData.publicUrl,
                file_type: 'application/pdf',
                file_size: blob.size,
                category: 'receipt',
                property_id: property?.id || null,
                unit_id: unit.id || null,
                client_id: tenant?.id || null,
                payment_id: payment.id || null,
                document_type: 'receipt',
              })
              .select()
              .single();
            if (docError) throw docError;

            // Return the full document record
            resolve(doc);
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Generate a rent reminder letter PDF.
   * Returns the created document record.
   */
  async generateReminder(reminder, unit) {
    if (!reminder || !unit) {
      throw new Error('Invalid reminder or unit data');
    }

    const property = unit.property;
    const tenant = unit.tenant;

    const docDefinition = {
      content: [
        { text: 'RENT PAYMENT REMINDER', style: 'header' },
        { text: `Date: ${new Date().toLocaleDateString()}`, alignment: 'right' },
        { text: '\n' },
        { text: `Dear ${tenant?.name || 'Tenant'},` },
        { text: '\n' },
        { text: `This is a friendly reminder that rent for **${property?.name || 'Property'} – ${unit.unit_number || 'Unit'}** is due on **${reminder.scheduled_date ? new Date(reminder.scheduled_date).toLocaleDateString() : 'N/A'}**.`, lineHeight: 1.5 },
        { text: '\n' },
        { text: `Amount Due: ₦${unit.rent_amount ? unit.rent_amount.toLocaleString() : '0'}`, bold: true, fontSize: 14 },
        { text: '\n' },
        { text: 'Please make payment promptly to avoid late fees. You can pay via bank transfer or contact the estate office.' },
        { text: '\n\n' },
        { text: 'Thank you for your prompt attention.', italics: true },
        { text: '\n\n' },
        { text: 'Regards,', lineHeight: 2 },
        { text: property?.name || 'Property Management', bold: true },
        { text: 'Estate Management' }
      ],
      styles: {
        header: { fontSize: 20, bold: true, margin: [0, 0, 0, 15] }
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBlob(async (blob) => {
          try {
            const fileName = `reminders/${reminder.id || Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
              .from('estate-documents')
              .upload(fileName, blob, { contentType: 'application/pdf' });
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('estate-documents')
              .getPublicUrl(fileName);

            const { data: doc, error: docError } = await supabase
              .from('estate_documents')
              .insert({
                estate_firm_id: property?.estate_firm_id || null,
                name: `Rent Reminder - ${unit.unit_number || 'Unit'} - ${reminder.scheduled_date || ''}`,
                file_url: urlData.publicUrl,
                file_type: 'application/pdf',
                file_size: blob.size,
                category: 'reminder',
                property_id: property?.id || null,
                unit_id: unit.id || null,
                client_id: tenant?.id || null,
                reminder_id: reminder.id || null,
                document_type: 'reminder',
              })
              .select()
              .single();
            if (docError) throw docError;

            resolve(doc);
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Generate a custom report PDF
   * Returns the created document record
   */
  async generateReport(docDefinition, metadata = {}) {
    if (!docDefinition) {
      throw new Error('Report definition is required');
    }

    const { title = 'report', estate_firm_id = null } = metadata;

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBlob(async (blob) => {
          try {
            // Generate unique filename
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileName = `reports/${estate_firm_id || 'system'}/${title}-${timestamp}-${randomStr}.pdf`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('estate-documents')
              .upload(fileName, blob, { contentType: 'application/pdf' });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('estate-documents')
              .getPublicUrl(fileName);

            // Create document record
            const { data: doc, error: docError } = await supabase
              .from('estate_documents')
              .insert({
                estate_firm_id: estate_firm_id || null,
                name: `${title} - ${new Date().toLocaleDateString()}`,
                file_url: urlData.publicUrl,
                file_type: 'application/pdf',
                file_size: blob.size,
                category: 'report',
                document_type: 'report',
                metadata: {
                  generated_at: new Date().toISOString(),
                  ...metadata
                }
              })
              .select()
              .single();

            if (docError) throw docError;

            resolve(doc);
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Generate a custom invoice PDF
   */
  async generateInvoice(invoiceData) {
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      notes,
      estate_firm_id = null
    } = invoiceData;

    const docDefinition = {
      content: [
        { text: 'INVOICE', style: 'header' },
        { text: `Invoice #: ${invoiceNumber}`, alignment: 'right' },
        { text: `Date: ${new Date().toLocaleDateString()}`, alignment: 'right' },
        { text: `Due Date: ${new Date(dueDate).toLocaleDateString()}`, alignment: 'right' },
        { text: '\n' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Bill To:\n', bold: true },
                clientName,
                clientEmail ? `\n${clientEmail}` : ''
              ]
            }
          ]
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              ['Description', 'Quantity', 'Amount'],
              ...items.map(item => [
                item.description,
                item.quantity.toString(),
                `₦${item.amount.toLocaleString()}`
              ])
            ]
          }
        },
        { text: '\n' },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              text: [
                { text: 'Subtotal: ', bold: true },
                `₦${subtotal.toLocaleString()}\n`,
                { text: 'Tax: ', bold: true },
                `₦${tax.toLocaleString()}\n`,
                { text: 'Total: ', bold: true, fontSize: 14 },
                { text: `₦${total.toLocaleString()}`, fontSize: 14, bold: true }
              ]
            }
          ]
        },
        { text: '\n' },
        { text: notes || 'Thank you for your business!', italics: true }
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 20] }
      }
    };

    return this.generateReport(docDefinition, {
      title: `invoice-${invoiceNumber}`,
      estate_firm_id
    });
  },

  /**
   * Generate a property listing PDF
   */
  async generatePropertyListing(property, metadata = {}) {
    const {
      title,
      description,
      price,
      address,
      bedrooms,
      bathrooms,
      area,
      amenities = [],
      images = [],
      landlordName,
      landlordPhone,
      estate_firm_id = null
    } = property;

    const docDefinition = {
      content: [
        { text: title || 'Property Listing', style: 'header' },
        { text: '\n' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Price: ', bold: true },
                `₦${(price || 0).toLocaleString()}/year\n`,
                { text: 'Location: ', bold: true },
                `${address || 'N/A'}\n`,
                { text: 'Bedrooms: ', bold: true },
                `${bedrooms || 0}\n`,
                { text: 'Bathrooms: ', bold: true },
                `${bathrooms || 0}\n`,
                { text: 'Area: ', bold: true },
                `${area || 0} sq m`
              ]
            }
          ]
        },
        { text: '\n' },
        { text: 'Description', style: 'subheader' },
        { text: description || 'No description available.' },
        { text: '\n' },
        { text: 'Amenities', style: 'subheader' },
        {
          ul: amenities.map(a => a.toString())
        },
        { text: '\n' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Contact Information\n', bold: true },
                `Landlord: ${landlordName || 'N/A'}\n`,
                `Phone: ${landlordPhone || 'N/A'}`
              ]
            }
          ]
        }
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    return this.generateReport(docDefinition, {
      title: `property-${title?.toLowerCase().replace(/\s+/g, '-') || 'listing'}`,
      estate_firm_id
    });
  }
};