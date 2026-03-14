// src/shared/lib/documentGenerator.js
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { supabase } from './supabaseClient';

// Set up fonts (pdfmake requires this)
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const documentGenerator = {
  /**
   * Generate a rent receipt PDF, upload to storage, and create estate_document record.
   * Returns the created document record (including id, file_url, etc.)
   */
  async generateReceipt(payment) {
    const { unit, amount, payment_date, id } = payment;
    const property = unit.property;
    const tenant = unit.tenant;

    // Define PDF document structure
    const docDefinition = {
      content: [
        { text: 'RENT RECEIPT', style: 'header' },
        { text: `Receipt No: ${id.slice(0, 8)}`, alignment: 'right' },
        { text: '\n' },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Property: ', bold: true },
                `${property.name}\n`,
                { text: 'Unit: ', bold: true },
                `${unit.unit_number}\n`,
                { text: 'Tenant: ', bold: true },
                `${tenant?.name || 'N/A'}\n`,
              ]
            },
            {
              width: '50%',
              text: [
                { text: 'Date: ', bold: true },
                `${new Date(payment_date).toLocaleDateString()}\n`,
                { text: 'Amount: ', bold: true },
                { text: `₦${amount.toLocaleString()}`, fontSize: 14, bold: true },
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
              ['Payment Date', new Date(payment_date).toLocaleDateString()],
              ['Amount', `₦${amount.toLocaleString()}`],
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
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob(async (blob) => {
        try {
          // Upload to Supabase Storage
          const fileName = `receipts/${payment.id}.pdf`;
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
              estate_firm_id: property.estate_firm_id,
              name: `Rent Receipt - ${unit.unit_number} - ${payment_date}`,
              file_url: urlData.publicUrl,
              file_type: 'application/pdf',
              file_size: blob.size,
              category: 'receipt',
              property_id: property.id,
              unit_id: unit.id,
              client_id: tenant?.id,
              payment_id: payment.id,
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
    });
  },

  /**
   * Generate a rent reminder letter PDF.
   * Returns the created document record.
   */
  async generateReminder(reminder, unit) {
    const property = unit.property;
    const tenant = unit.tenant;

    const docDefinition = {
      content: [
        { text: 'RENT PAYMENT REMINDER', style: 'header' },
        { text: `Date: ${new Date().toLocaleDateString()}`, alignment: 'right' },
        { text: '\n' },
        { text: `Dear ${tenant?.name || 'Tenant'},` },
        { text: '\n' },
        { text: `This is a friendly reminder that rent for **${property.name} – ${unit.unit_number}** is due on **${new Date(reminder.scheduled_date).toLocaleDateString()}**.`, lineHeight: 1.5 },
        { text: '\n' },
        { text: `Amount Due: ₦${unit.rent_amount.toLocaleString()}`, bold: true, fontSize: 14 },
        { text: '\n' },
        { text: 'Please make payment promptly to avoid late fees. You can pay via bank transfer or contact the estate office.' },
        { text: '\n\n' },
        { text: 'Thank you for your prompt attention.', italics: true },
        { text: '\n\n' },
        { text: 'Regards,', lineHeight: 2 },
        { text: property.name, bold: true },
        { text: 'Estate Management' }
      ],
      styles: {
        header: { fontSize: 20, bold: true, margin: [0, 0, 0, 15] }
      }
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob(async (blob) => {
        try {
          const fileName = `reminders/${reminder.id}.pdf`;
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
              estate_firm_id: property.estate_firm_id,
              name: `Rent Reminder - ${unit.unit_number} - ${reminder.scheduled_date}`,
              file_url: urlData.publicUrl,
              file_type: 'application/pdf',
              file_size: blob.size,
              category: 'reminder',
              property_id: property.id,
              unit_id: unit.id,
              client_id: tenant?.id,
              reminder_id: reminder.id,
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
    });
  }
};