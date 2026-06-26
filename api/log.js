const SUPABASE_URL = 'https://wuzcvgucszxoefcscqkd.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emN2Z3Vjc3p4b2VmY3NjcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODU3NjAsImV4cCI6MjA5ODA2MTc2MH0.rnibj12j6stQHFbS3lkKhNSvKYmCi_sM5s-vLLmTg88';

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, data } = req.body;

  try {
    if (action === 'log_enquiry') {
      await fetch(`${SUPABASE_URL}/enquiries`, {
        method: 'POST', headers: HEADERS, body: JSON.stringify(data)
      });
    }
    else if (action === 'raise_deposit_invoice') {
      await fetch(`${SUPABASE_URL}/invoices`, {
        method: 'POST', headers: HEADERS, body: JSON.stringify(data.invoice)
      });
      await fetch(`${SUPABASE_URL}/projects`, {
        method: 'POST', headers: HEADERS, body: JSON.stringify(data.project)
      });
      await fetch(`${SUPABASE_URL}/enquiries?quote_no=eq.${data.quote_no}`, {
        method: 'PATCH', headers: HEADERS, body: JSON.stringify({ status: 'Won' })
      });
      if (data.client) {
        await fetch(`${SUPABASE_URL}/clients`, {
          method: 'POST',
          headers: { ...HEADERS, 'Prefer': 'resolution=ignore-duplicates,return=representation' },
          body: JSON.stringify(data.client)
        });
      }
    }
    else if (action === 'raise_invoice') {
      await fetch(`${SUPABASE_URL}/invoices`, {
        method: 'POST', headers: HEADERS, body: JSON.stringify(data)
      });
    }
    else if (action === 'mark_paid') {
      await fetch(`${SUPABASE_URL}/invoices?invoice_no=eq.${data.invoice_no}`, {
        method: 'PATCH', headers: HEADERS, body: JSON.stringify({ status: 'Paid' })
      });
    }
    else if (action === 'close_project') {
      await fetch(`${SUPABASE_URL}/projects?quote_no=eq.${data.quote_no}`, {
        method: 'PATCH', headers: HEADERS, body: JSON.stringify({ status: 'Closed' })
      });
    }
    else if (action === 'update_drive_url') {
      await fetch(`${SUPABASE_URL}/${data.table}?${data.match_field}=eq.${data.match_value}`, {
        method: 'PATCH', headers: HEADERS, body: JSON.stringify({ drive_url: data.drive_url })
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
