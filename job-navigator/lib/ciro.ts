export async function callCiro({ name, company, linkedinUrl }: any) {
  // Return mock data if API key is not configured
  if (!process.env.CIRO_API_KEY) {
    console.warn('CIRO_API_KEY not configured, returning mock data')
    
    // Parse name for mock data generation
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || 'unknown'
    const lastName = nameParts.slice(1).join(' ') || 'user'
    
    return {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '+1-555-0100'
    }
  }

  const res = await fetch("https://api.ciro.ai/enrich", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CIRO_API_KEY!,
    },
    body: JSON.stringify({ name, company, linkedinUrl })
  });

  if (!res.ok) throw new Error("Ciro enrichment failed");
  const data = await res.json();

  return {
    email: data.email || null,
    phone: data.phone || null
  };
}

// Legacy export for backward compatibility
export const enrichLead = callCiro