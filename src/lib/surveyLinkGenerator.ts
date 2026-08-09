/**
 * Survey Link Generator
 * Generates shareable links and QR codes for stakeholder surveys
 */

export type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

export interface SurveyLink {
  stakeholderType: StakeholderType;
  displayName: string;
  url: string;
  qrData: string; // QR code data for encoding
}

/**
 * Generate survey link for a stakeholder type
 */
export function generateSurveyLink(
  assessmentId: string,
  stakeholderType: StakeholderType,
  baseUrl: string = window.location.origin
): SurveyLink {
  const url = `${baseUrl}/survey/${assessmentId}/${stakeholderType}`;

  const displayNames: Record<StakeholderType, string> = {
    teacher: 'Teachers',
    parent: 'Parents / Guardians',
    student: 'Students',
    admin: 'Admin / Management',
    other: 'Other Stakeholders'
  };

  return {
    stakeholderType,
    displayName: displayNames[stakeholderType],
    url,
    qrData: url // This is what gets encoded into QR code
  };
}

/**
 * Generate survey links for all stakeholder types
 */
export function generateAllSurveyLinks(
  assessmentId: string,
  expectedRespondents: Record<StakeholderType, number>,
  baseUrl?: string
): SurveyLink[] {
  const types: StakeholderType[] = ['teacher', 'parent', 'student', 'admin', 'other'];

  return types
    .filter(type => expectedRespondents[type] > 0) // Only include types with expected respondents
    .map(type => generateSurveyLink(assessmentId, type, baseUrl));
}

/**
 * Get color for stakeholder type
 */
export function getStakeholderColor(type: StakeholderType): { bg: string; border: string; text: string } {
  const colors: Record<StakeholderType, { bg: string; border: string; text: string }> = {
    teacher: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600'
    },
    parent: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600'
    },
    student: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600'
    },
    admin: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600'
    },
    other: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600'
    }
  };

  return colors[type];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share link via Web Share API (if available)
 */
export async function shareLink(url: string, title: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: `DISHA Assessment - ${title}`,
      text: `Complete the 14-Dimension School Assessment`,
      url: url
    });
    return true;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * Generate text for email invitation
 */
export function generateEmailText(surveyLink: SurveyLink, schoolName: string): string {
  return `Dear ${surveyLink.displayName},

You are invited to participate in our 14-Dimension School Assessment for ${schoolName}.

Your feedback is valuable and will help us understand our school's strengths and areas for improvement.

Please complete the survey using this link:
${surveyLink.url}

The assessment takes approximately 15-20 minutes and includes 60+ questions across 14 key dimensions of school excellence.

Your responses are confidential and will be used for institutional improvement only.

Thank you for your participation!

Best regards,
${schoolName} Leadership Team`;
}

/**
 * Generate text for WhatsApp invitation
 */
export function generateWhatsAppText(surveyLink: SurveyLink, schoolName: string): string {
  return `🎓 *${schoolName} - School Assessment*

Dear ${surveyLink.displayName},

Please complete our 14-Dimension Assessment:

🔗 ${surveyLink.url}

⏱️ Takes 15-20 minutes
📋 60+ questions
🔒 Your responses are confidential

Thank you! 🙏`;
}

/**
 * Generate QR code data URL using external API (if needed)
 * Note: In the app, we'll use qrcode.react library for client-side generation
 */
export function getQRCodeApiUrl(data: string, size: number = 300): string {
  // Using goQR.me API as fallback (public API, no auth needed)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
