export interface LeadData {
  firstName: string
  lastName: string
  title: string
  company: string
  companySize?: string
  industry?: string
}

export interface EnrichedLeadData {
  name: string
  title: string
  company: string
  connectionDegree?: string | null
  email?: string
  phone?: string
}

export interface HierarchyAndEmailResult {
  hierarchy: string
  emailTemplate: string
}

export interface HierarchyInference {
  seniorityLevel: string
  department: string
  hierarchy: {
    level: number
    reportsTo?: string[]
    manages?: string[]
  }
}

export interface EmailGeneration {
  subject: string
  content: string
}

export async function callClaude(prompt: string) {
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('CLAUDE_API_KEY not configured, returning mock data')
    
    // Return mock response based on prompt content
    if (prompt.includes('hierarchy') && prompt.includes('email')) {
      return `Hierarchy: Director-level, reports to VP, manages team of engineers\nEmail: Subject: Exploring Product Management Opportunities\n\nDear Hiring Manager,\n\nI am reaching out regarding potential Product Manager opportunities at your organization. With my background in technical product management and team scaling, I believe I could contribute significantly to your product initiatives.\n\nWould you be available for a brief conversation to discuss how my experience might align with your team's needs?\n\nBest regards,\n[Your Name]`
    }
    
    return 'Mock response for: ' + prompt.substring(0, 100)
  }
  
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });
  
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function inferHierarchy(lead: LeadData): Promise<HierarchyInference> {
  const prompt = `Based on this job title and company information, infer the organizational hierarchy:
        
        Name: ${lead.firstName} ${lead.lastName}
        Title: ${lead.title}
        Company: ${lead.company}
        Company Size: ${lead.companySize || 'Unknown'}
        Industry: ${lead.industry || 'Unknown'}
        
        Return a JSON object with:
        - seniorityLevel (e.g., "C-Level", "VP", "Director", "Manager", "Individual Contributor")
        - department (e.g., "Engineering", "Sales", "Marketing", "Operations")
        - hierarchy object with:
          - level (1-5, where 1 is C-Level)
          - reportsTo (array of likely reporting positions)
          - manages (array of likely direct report positions)
        
        Return only valid JSON, no additional text.`;

  try {
    const response = await callClaude(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Claude API hierarchy inference failed:', error)
    // Return default hierarchy on error
    return {
      seniorityLevel: 'Director',
      department: 'Engineering',
      hierarchy: {
        level: 3,
        reportsTo: ['VP of Engineering'],
        manages: ['Senior Engineers', 'Engineers']
      }
    }
  }
}

export async function generateHierarchyAndEmail(lead: EnrichedLeadData): Promise<HierarchyAndEmailResult> {
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('CLAUDE_API_KEY not configured, returning mock data')
    return {
      hierarchy: 'Director-level, reports to VP of Engineering, manages Senior Engineers',
      emailTemplate: `Subject: Connecting with ${lead.company} Engineering Leadership\n\nHi ${lead.name},\n\nI noticed your role as ${lead.title} at ${lead.company} and was impressed by your team's recent achievements.\n\nAs someone in a ${lead.connectionDegree || '2nd'} degree connection, I wanted to reach out about potential opportunities for Product Managers with experience in scaling technical teams.\n\nWould you be open to a brief 15-minute call to discuss how my background might align with ${lead.company}'s growth plans?\n\nBest regards,\n[Your Name]`
    }
  }

  try {
    const prompt = `Given the title "${lead.title}", infer the hierarchy level (VP, Director, etc.)
        and draft a personalized outreach email for a Product Manager job search.
        Return format:
        Hierarchy: [description]
        Email: [subject and body]`;
    
    const augmentation = await callClaude(prompt);
    
    // Parse the response - split by "Hierarchy:" and "Email:" markers
    const hierarchy = augmentation.split("Hierarchy:")[1]?.split("Email:")[0]?.trim() || "Unable to determine hierarchy";
    const emailTemplate = augmentation.split("Email:")[1]?.trim() || "Unable to generate email template";
    
    return {
      hierarchy,
      emailTemplate
    }
  } catch (error) {
    console.error('Claude API generation failed:', error)
    throw new Error('Failed to generate hierarchy and email')
  }
}

export async function generateEmail(lead: LeadData, context: string = ''): Promise<EmailGeneration> {
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('CLAUDE_API_KEY not configured, returning mock email')
    return {
      subject: `Quick question about ${lead.company}'s tech stack`,
      content: `Hi ${lead.firstName},

I noticed your role as ${lead.title} at ${lead.company} and was impressed by your team's recent achievements.

I'm reaching out because we've helped similar companies in the ${lead.industry || 'your'} industry streamline their operations and achieve significant efficiency gains.

Would you be open to a brief 15-minute call next week to discuss how we might be able to help ${lead.company} as well?

Best regards,
[Your Name]`
    }
  }

  try {
    const prompt = `Generate a personalized outreach email for this lead:
        
        Name: ${lead.firstName} ${lead.lastName}
        Title: ${lead.title}
        Company: ${lead.company}
        Company Size: ${lead.companySize || 'Unknown'}
        Industry: ${lead.industry || 'Unknown'}
        
        ${context ? `Additional context: ${context}` : ''}
        
        Create a professional, personalized email that:
        1. Shows research about their role and company
        2. Provides value or insight
        3. Has a clear but soft call-to-action
        4. Is concise (under 150 words)
        
        Return a JSON object with:
        - subject: email subject line
        - content: email body
        
        Return only valid JSON, no additional text.`;
    
    const response = await callClaude(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Claude API email generation failed:', error)
    throw new Error('Failed to generate email')
  }
}