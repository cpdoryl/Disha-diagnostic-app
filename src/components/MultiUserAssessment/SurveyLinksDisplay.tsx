import React, { useState } from 'react';
import { Copy, Share2, Download, Mail, MessageCircle, Check } from 'lucide-react';
import {
  generateAllSurveyLinks,
  getStakeholderColor,
  copyToClipboard,
  shareLink,
  generateEmailText,
  generateWhatsAppText,
  type StakeholderType,
} from '../../lib/surveyLinkGenerator';

interface SurveyLinksDisplayProps {
  assessmentId: string;
  schoolName: string;
  expectedRespondents: Record<StakeholderType, number>;
}

export function SurveyLinksDisplay({
  assessmentId,
  schoolName,
  expectedRespondents,
}: SurveyLinksDisplayProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showQRCodes, setShowQRCodes] = useState(false);

  const surveyLinks = generateAllSurveyLinks(assessmentId, expectedRespondents);

  const handleCopyLink = async (url: string, type: StakeholderType) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleShare = async (url: string) => {
    const success = await shareLink(url, schoolName);
    if (!success) {
      // Fallback: copy to clipboard
      await copyToClipboard(url);
    }
  };

  const handleEmailShare = (link: React.ReactNode, type: StakeholderType) => {
    const surveyLink = surveyLinks.find(l => l.stakeholderType === type);
    if (!surveyLink) return;

    const emailBody = generateEmailText(surveyLink, schoolName);
    const mailtoLink = `mailto:?subject=DISHA Assessment - ${surveyLink.displayName}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  const handleWhatsAppShare = (type: StakeholderType) => {
    const surveyLink = surveyLinks.find(l => l.stakeholderType === type);
    if (!surveyLink) return;

    const message = generateWhatsAppText(surveyLink, schoolName);
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">📋 Survey Links for Stakeholders</h3>
        <p className="text-gray-600">
          Share these links or QR codes with stakeholders to collect their 14D assessment responses
        </p>
      </div>

      {/* Toggle QR Codes */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowQRCodes(!showQRCodes)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
        >
          {showQRCodes ? '📝 Hide QR Codes' : '📱 Show QR Codes'}
        </button>
      </div>

      {/* Survey Links */}
      <div className="space-y-4">
        {surveyLinks.map((surveyLink) => {
          const color = getStakeholderColor(surveyLink.stakeholderType);
          const expectedCount = expectedRespondents[surveyLink.stakeholderType];

          return (
            <div key={surveyLink.stakeholderType} className={`border rounded-lg p-6 ${color.bg} ${color.border}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className={`font-bold text-lg ${color.text}`}>{surveyLink.displayName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Expected respondents: <span className="font-semibold">{expectedCount}</span>
                  </p>
                </div>
              </div>

              {/* Link Display */}
              <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200 flex items-center justify-between">
                <code className="text-sm text-gray-700 truncate flex-1">{surveyLink.url}</code>
                <button
                  onClick={() => handleCopyLink(surveyLink.url, surveyLink.stakeholderType)}
                  className="ml-3 p-2 hover:bg-gray-100 rounded transition flex-shrink-0"
                  title="Copy link"
                >
                  {copiedLink === surveyLink.stakeholderType ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* QR Code (if toggled) */}
              {showQRCodes && (
                <div className="bg-white rounded-lg p-4 mb-4 text-center border border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      surveyLink.url
                    )}`}
                    alt={`QR Code for ${surveyLink.displayName}`}
                    className="mx-auto rounded"
                  />
                  <p className="text-xs text-gray-600 mt-2">Scan to access survey</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleCopyLink(surveyLink.url, surveyLink.stakeholderType)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 ${
                    copiedLink === surveyLink.stakeholderType
                      ? `bg-green-100 text-green-700`
                      : `bg-white border border-gray-300 hover:bg-gray-50 text-gray-700`
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  onClick={() => handleShare(surveyLink.url)}
                  className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  onClick={() => handleEmailShare(surveyLink.url, surveyLink.stakeholderType)}
                  className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                  title="Send via email"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email</span>
                </button>

                <button
                  onClick={() => handleWhatsAppShare(surveyLink.stakeholderType)}
                  className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📲 How to Share:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Copy:</strong> Copy the link and paste in email, chat, or SMS</li>
          <li>• <strong>QR Code:</strong> Print or screenshot the QR code and share visually</li>
          <li>• <strong>Email:</strong> Send pre-formatted invitation via email client</li>
          <li>• <strong>WhatsApp:</strong> Share message directly via WhatsApp</li>
          <li>• <strong>Note:</strong> Each stakeholder type has a unique survey link</li>
        </ul>
      </div>

      {/* Download QR Sheet Button */}
      {showQRCodes && (
        <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Print QR Code Sheet
        </button>
      )}
    </div>
  );
}

export default SurveyLinksDisplay;
