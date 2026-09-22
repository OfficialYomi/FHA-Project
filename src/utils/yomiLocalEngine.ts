import { Project, ValuationRequest, Contractor, RiskAlert, ContractorScorecard } from '../types';

/**
 * High-precision role-scoped project intelligence query engine.
 * Provides resilient, zero-downtime analytics even when hosting on static servers
 * (e.g. GitHub Pages) or when backend endpoints are temporarily unreachable.
 */
export function stripRedundantGreeting(text: string): string {
  if (!text) return text;
  let cleaned = text.trim();
  // Strip opening greetings like "Good day, **Honourable Managing Director & CEO**."
  cleaned = cleaned.replace(/^(?:(?:Hello|Hi|Greetings|Good (?:day|morning|afternoon|evening))[^.\n]*[.\n]+)/i, '');
  cleaned = cleaned.trim();
  // Strip "I am Yomi...", "I'm Yomi...", "This is Yomi...", "As Yomi..."
  cleaned = cleaned.replace(/^(?:(?:I am|I'm|This is|As)\s+\*?\*?Yomi\*?\*?[^.\n]*[.\n]+)/i, '');
  return cleaned.trim() || text;
}

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
    return "I exclusively answer tactical, operational, and financial questions directly concerning active housing projects in our database. I cannot answer queries outside our project portfolio.";
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

    return `Good day, **${title}**.

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

Based on live WBS milestone telemetry, here are the schemes requiring immediate attention:

| Estate Scheme | State | Contractor | Progress | Delivery Status | Overdue Days | Budget (₦) |
|---|---|---|---|---|---|---|
${delayedProjects.map(p => `| **${p.estateName}** | ${p.state} | ${p.contractorName} | **${p.progress}%** | ${p.status} | ${p.timelineExceededDays > 0 ? `${p.timelineExceededDays}d overdue` : 'Milestone attention'} | ₦${p.budget.toLocaleString()} |`).join('\n')}

${userRole === 'MD' ? '💡 **Executive Recommendation**: Direct the Zonal Project Manager to issue an immediate site query and schedule an on-site milestone compliance review.' : ''}`;
  }

  if (q.includes('roof') || q.includes('roofing')) {
    const atRoofing = projects.filter(p => p.stages && p.stages['Roofing'] === true && !p.stages['Finishes']);
    const pendingRoofing = projects.filter(p => p.stages && p.stages['Lintel'] === true && !p.stages['Roofing']);

    return `### 🏗️ Tactical Milestone Status: Roofing Stage Audit

| Estate Scheme | State | Contractor | Progress | Roofing Stage Status | Key Action Required |
|---|---|---|---|---|---|
${atRoofing.map(p => `| **${p.estateName}** | ${p.state} | ${p.contractorName} | **${p.progress}%** | Active Roofing | Roof trussing & coverings underway |`).join('\n')}
${pendingRoofing.map(p => `| **${p.estateName}** | ${p.state} | ${p.contractorName} | **${p.progress}%** | Ready for Roofing | Lintel completed; ready for truss fabrication |`).join('\n')}
${atRoofing.length === 0 && pendingRoofing.length === 0 ? '| *None* | — | — | — | Substructures Active | Foundations in progress on earlier stage schemes |' : ''}`;
  }

  if (q.includes('spent') || q.includes('budget') || q.includes('cost') || q.includes('financ') || q.includes('disburs')) {
    const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
    const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return `### 💰 Financial Execution & Capital Disbursement Overview

- **Total Programme Allocation**: **₦${totalBudget.toLocaleString()}**
- **Total Certified Disbursements**: **₦${totalSpent.toLocaleString()}**
- **Capital Utilization Rate**: **${pct}%**

| Estate Scheme | State | Total Budget | Amount Disbursed | Capital Utilization | Delivery Status |
|---|---|---|---|---|---|
${projects.map(p => {
  const util = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
  return `| **${p.estateName}** | ${p.state} | ₦${p.budget.toLocaleString()} | ₦${p.spent.toLocaleString()} | **${util}%** | ${p.status} |`;
}).join('\n')}`;
  }

  if (q.includes('valuation') || q.includes('invoice') || q.includes('claim')) {
    return `### 📑 Interim Valuation Claims & Milestone Certification Audit

Total active interim valuation requests: **${valuations.length}**

| Invoice No. | Estate Scheme | Contractor | Claimed Amount | Certified Amount | Workflow Approval Gate | Site Photos |
|---|---|---|---|---|---|---|
${valuations.map(v => `| \`${v.invoiceNumber}\` | **${v.estateName}** | ${v.contractorName} | ₦${v.amountRequested.toLocaleString()} | ₦${((v.amountCertified || v.amountRequested)).toLocaleString()} | \`${v.currentStage.replace(/_/g, ' ').toUpperCase()}\` | ${v.photos?.length || 0} photo(s) |`).join('\n')}

${userRole === 'QS' ? '💡 **QS Directive**: Ensure all claimed quantities are matched against certified bill of quantities before endorsing interim valuation certificates.' : ''}`;
  }

  if (q.includes('contractor') || q.includes('score') || q.includes('rating')) {
    return `### 👷 Contractor Performance & Delivery Audit

| Contractor Company | Registration No. | Assigned Schemes | Contract Value | Performance Rating | Bank Partner | Prequalification |
|---|---|---|---|---|---|---|
${contractors.map(c => `| **${c.companyName}** | \`${c.registrationNo}\` | ${c.assignedProjectsCount} site(s) | ₦${c.contractAmount.toLocaleString()} | **${c.rating ? `${c.rating}/5.0` : 'Under Evaluation'}** | ${c.bankName} | ${c.status.toUpperCase()} |`).join('\n')}`;
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

- **Delivery Status**: **${matchedProject.status.toUpperCase()}**
- **Physical Progress**: **${matchedProject.progress}%**
- **Housing Typology**: ${matchedProject.houseType} (${matchedProject.houseCount} housing units)
- **Contractor**: **${matchedProject.contractorName}** | **Project Manager**: ${matchedProject.projectManager}
- **Budget**: ₦${matchedProject.budget.toLocaleString()} | **Disbursed**: ₦${matchedProject.spent.toLocaleString()}

| Construction Stage | Verification Status | Milestone Remarks |
|---|---|---|
${Object.entries(matchedProject.stages || {}).map(([stage, isDone]) => `| **${stage}** | ${isDone ? 'Completed' : 'Pending'} | ${isDone ? 'Verified through resident engineer GPS log' : 'Scheduled for upcoming work package'} |`).join('\n')}

- **Logged Site Telemetry**: ${matchedProject.photoUpdates?.length || 0} geo-tagged inspection photos logged.`;
  }

  // General executive summary
  return `### 🏛️ Federal Housing Authority Delivery Cockpit Summary

| Delivery Metric | Portfolio Telemetry | Notes |
|---|---|---|
| **Active Estate Schemes** | **${projects.length}** estates | Distributed across **${new Set(projects.map(p => p.state)).size}** Nigerian states |
| **Total Units Under Construction** | **${projects.reduce((acc, p) => acc + (p.houseCount || 0), 0)}** units | Renewed Hope Cities & Estates |
| **Schemes on Schedule** | **${projects.filter(p => p.status === 'On Schedule').length}** schemes | Progressing within target milestones |
| **Schemes Completed** | **${projects.filter(p => p.status === 'Completed').length}** schemes | Ready or delivered for commissioning |
| **Requiring Attention / Overdue** | **${projects.filter(p => p.status === 'Needs Attention' || p.status === 'Delayed').length}** schemes | Monitored by zonal project managers |

Ask specific queries (e.g. *"Which projects are delayed?"*, *"Show Kada Hill progress"*, *"Valuation claims awaiting certification"*, *"Disbursement audit"*).`;
}
