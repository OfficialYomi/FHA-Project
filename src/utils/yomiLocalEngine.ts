import { Project, ValuationRequest, Contractor, RiskAlert, ContractorScorecard } from '../types';

/**
 * High-precision role-scoped project intelligence query engine.
 * Provides resilient, zero-downtime analytics even when hosting on static servers
 * (e.g. GitHub Pages) or when backend endpoints are temporarily unreachable.
 */
export function queryYomiLocalIntelligence(
  message: string,
  userRole: string = 'MD',
  username: string = '',
  selectedProjectId?: string,
  projects: Project[] = [],
  valuations: ValuationRequest[] = [],
  contractors: Contractor[] = [],
  alerts: RiskAlert[] = [],
  scorecards: ContractorScorecard[] = []
): string {
  const q = message.toLowerCase().trim();

  // Negative constraint check: Detect non-project questions
  const projectKeywords = [
    'project', 'estate', 'house', 'housing', 'contractor', 'stage', 'foundation', 'roofing', 
    'block', 'lintel', 'excavation', 'budget', 'spent', 'cost', 'valuation', 'certif', 'invoice', 
    'naira', 'cbn', 'rtgs', 'payment', 'disburse', 'progress', 'delay', 'overdue', 'schedule', 
    'alert', 'risk', 'scorecard', 'rating', 'kaduna', 'abuja', 'lagos', 'rivers', 'kano', 
    'kada', 'gwarinpa', 'isheri', 'rumuokoro', 'dala', 'nze', 'abc', 'dantata', 'cappa', 
    'brief', 'report', 'status', 'milestone', 'photo', 'gps', 'wbs', 'bello', 'musa', 'adebayo',
    'amaechi', 'ibrahim', 'work', 'unit', 'bungalow', 'duplex', 'terrace', 'inspection', 'engineer',
    'who', 'what', 'where', 'which', 'how', 'show', 'list', 'summary', 'details'
  ];

  const hasProjectContext = projectKeywords.some(k => q.includes(k)) || !!selectedProjectId;

  // General non-project questions rejection
  const nonProjectGreetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const isJustGreeting = nonProjectGreetings.some(g => q === g || q === `${g} yomi` || q === `yomi`);

  if (!hasProjectContext && !isJustGreeting) {
    return "I am Yomi, your Project Delivery AI Assistant. I exclusively answer tactical, operational, and financial questions directly concerning the active housing projects in our database. I cannot answer queries outside our project portfolio.";
  }

  if (isJustGreeting) {
    const roleTitles: Record<string, string> = {
      MD: "Honourable Managing Director & CEO",
      PM: "Project Manager",
      QS: "Lead Quantity Surveyor",
      RE: "Resident Engineer",
      FD: "Director of Finance",
      CT: "Treasury Head"
    };
    const title = roleTitles[userRole] || "Executive";
    const jurisdictionDesc = userRole === 'MD' 
      ? "You have full, unrestricted nationwide jurisdiction across all states, finances, contractors, and alerts."
      : userRole === 'QS'
      ? "Your authorized scope covers financial valuations, bill of quantities (BOQ), certified sums, and milestone claims."
      : userRole === 'RE'
      ? "Your authorized scope covers tactical on-site construction stages, physical inspections, and photo updates for your assigned sites."
      : userRole === 'FD' || userRole === 'CT'
      ? "Your authorized scope covers project allocations, expenditure, payment releases, and treasury disbursements."
      : "Your authorized scope covers project scheduling, WBS milestone progression, and contractor performance.";

    return `Good day, **${title}**. I am **Yomi**, the Executive AI Assistant for the Federal Housing Authority (FHA).

${jurisdictionDesc}

You can ask me questions in natural language or structured queries. How may I assist with your project portfolio today?`;
  }

  // Role Jurisdiction Checks
  if (userRole === 'RE' && (q.includes('cbn') || q.includes('treasury reserve') || q.includes('rtgs') || q.includes('ministerial allocation'))) {
    return "As a **Resident Engineer**, your jurisdiction is focused on on-site physical progress, milestone inspections, and technical quality on your assigned project sites. High-level treasury reserves and ministerial disbursements fall under the jurisdiction of the **Finance Director** and the **Managing Director**.";
  }

  if (userRole === 'RE' && (q.includes('rivers') || q.includes('rumuokoro') || q.includes('kano') || q.includes('dala'))) {
    return "As a **Resident Engineer**, your active site assignment covers **Kada Hill Estate (Kaduna)** and **Gwarinpa Vista Heights (Abuja)**. You do not have on-site jurisdiction over the Rivers or Kano estates. For nationwide project inquiries, please consult the **Project Manager** or **Managing Director**.";
  }

  // Answer specific tactical / financial questions directly from live database
  if (q.includes('behind') || q.includes('delay') || q.includes('overdue') || q.includes('late')) {
    const delayedProjects = projects.filter(p => p.status === 'Delayed' || p.status === 'Needs Attention' || p.timelineExceededDays > 0);
    
    if (delayedProjects.length === 0) {
      return "All active projects across the FHA portfolio are currently progressing on schedule with zero critical timeline overruns.";
    }

    return `### ⚠️ Tactical Schedule Audit: Projects Requiring Executive Attention

Based on live WBS milestone telemetry, here are the projects requiring immediate attention:

${delayedProjects.map((p, idx) => `**${idx + 1}. ${p.estateName} (${p.state} State)**:
- **Contractor**: ${p.contractorName}
- **Progress**: **${p.progress}%**
- **Status**: **${p.status.toUpperCase()}** (${p.timelineExceededDays > 0 ? `${p.timelineExceededDays} days overdue` : 'Milestone attention required'})
- **Budget**: ₦${p.budget.toLocaleString()} | **Spent**: ₦${p.spent.toLocaleString()}`).join('\n\n')}

${userRole === 'MD' ? '💡 **Executive Recommendation**: Direct the Zonal Project Manager to issue an immediate site query and schedule an on-site milestone compliance review.' : ''}`;
  }

  if (q.includes('roof') || q.includes('roofing')) {
    const atRoofing = projects.filter(p => p.stages && p.stages['Roofing'] === true && !p.stages['Finishes']);
    const pendingRoofing = projects.filter(p => p.stages && p.stages['Lintel'] === true && !p.stages['Roofing']);

    return `### 🏗️ Tactical Milestone Status: Roofing Stage

- **Currently at Roofing Stage**:
${atRoofing.length > 0 ? atRoofing.map(p => `  - **${p.estateName} (${p.state})**: Roof trussing and coverings underway (${p.progress}% overall completion)`).join('\n') : '  - None currently active at roofing stage.'}

- **Approaching Roofing Mobilization (Lintel Cast)**:
${pendingRoofing.length > 0 ? pendingRoofing.map(p => `  - **${p.estateName} (${p.state})**: Blockwork and lintel completed; ready for roof fabrication.`).join('\n') : '  - Foundations and substructures in progress on earlier stage schemes.'}`;
  }

  if (q.includes('spent') || q.includes('budget') || q.includes('cost') || q.includes('financ') || q.includes('disburs')) {
    const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
    const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return `### 💰 Financial Execution & Disbursement Overview

- **Total Programme Allocation**: **₦${totalBudget.toLocaleString()}**
- **Total Certified Disbursements**: **₦${totalSpent.toLocaleString()}**
- **Capital Utilization Rate**: **${pct}%**

#### Estate Breakdown:
${projects.map(p => `• **${p.estateName} (${p.state})**: Budget ₦${p.budget.toLocaleString()} | Spent ₦${p.spent.toLocaleString()} (${p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0}%) — *${p.status}*`).join('\n')}`;
  }

  if (q.includes('valuation') || q.includes('invoice') || q.includes('claim')) {
    return `### 📑 Valuation Claims & Milestone Certification Audit

Total interim valuation requests: **${valuations.length}**

${valuations.map((v, i) => `${i + 1}. **${v.estateName}** (${v.invoiceNumber}):
   - **Contractor**: ${v.contractorName}
   - **Claimed Amount**: **₦${v.amountRequested.toLocaleString()}**
   - **Certified Amount**: **₦${((v.amountCertified || v.amountRequested)).toLocaleString()}**
   - **Current Workflow Stage**: \`${v.currentStage.replace(/_/g, ' ').toUpperCase()}\`
   - **Photo Evidence**: ${v.photos?.length || 0} site photo(s) logged`).join('\n\n')}

${userRole === 'QS' ? '💡 **QS Directive**: Ensure all claimed quantities are matched against certified bill of quantities before endorsing interim valuation certificates.' : ''}`;
  }

  if (q.includes('contractor') || q.includes('score') || q.includes('rating')) {
    return `### 👷 Contractor Performance & Delivery Audit

${contractors.map(c => `• **${c.companyName}** (${c.registrationNo}):
   - **Contract Amount**: ₦${c.contractAmount.toLocaleString()} | **Duration**: ${c.durationMonths} months
   - **Assigned Sites**: ${c.assignedProjectsCount}
   - **Bank**: ${c.bankName}
   - **Rating**: ${c.rating ? `${c.rating}/5.0` : 'Under Evaluation'}
   - **Status**: ${c.status.toUpperCase()}`).join('\n\n')}`;
  }

  // Project-specific lookup
  const matchedProject = projects.find(p => 
    q.includes(p.state.toLowerCase()) || 
    q.includes(p.estateName.toLowerCase()) ||
    (selectedProjectId && p.id === selectedProjectId)
  );

  if (matchedProject) {
    const completedStages = Object.entries(matchedProject.stages || {}).filter(([_, done]) => done).map(([st]) => st);
    const pendingStages = Object.entries(matchedProject.stages || {}).filter(([_, done]) => !done).map(([st]) => st);

    return `### 📍 Estate Tactical Profile: ${matchedProject.estateName} (${matchedProject.state})

- **Status**: **${matchedProject.status.toUpperCase()}**
- **Physical Progress**: **${matchedProject.progress}%**
- **Typology**: ${matchedProject.houseType} (${matchedProject.houseCount} housing units)
- **Contractor**: **${matchedProject.contractorName}**
- **Project Manager**: ${matchedProject.projectManager}
- **Budget**: ₦${matchedProject.budget.toLocaleString()} | **Disbursed**: ₦${matchedProject.spent.toLocaleString()}
- **Completed Stages**: ${completedStages.join(', ') || 'Site clearing initialized'}
- **Next Critical Milestones**: ${pendingStages.slice(0, 3).join(', ') || 'Project in handover phase'}
- **Verified Site Photos**: ${matchedProject.photoUpdates?.length || 0} visual audit entries logged.`;
  }

  // General executive summary
  return `### 🏛️ Federal Housing Authority Delivery Cockpit Summary

- **Active Projects**: **${projects.length}** estate schemes across **${new Set(projects.map(p => p.state)).size}** states
- **Completed Schemes**: **${projects.filter(p => p.status === 'Completed').length}**
- **On Schedule**: **${projects.filter(p => p.status === 'On Schedule').length}**
- **Attention / Delayed**: **${projects.filter(p => p.status === 'Needs Attention' || p.status === 'Delayed').length}**
- **Total Housing Units Under Construction**: **${projects.reduce((acc, p) => acc + (p.houseCount || 0), 0)}** units

Feel free to ask a specific query (e.g., *"Which projects are delayed?"*, *"Show Kada Hill progress"*, *"Valuation claims awaiting certification"*, *"Disbursement audit"*).`;
}
