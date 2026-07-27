import React from 'react';

const ReportPDF = ({ scan, websiteUrl, scanHistory, isCombined = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getOverallScore = (s) => {
    return Math.round((s.seoScore + s.securityScore + s.complianceScore + s.performanceScore) / 4);
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (isCombined) {
    return (
      <div style={{
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        color: '#1a1a1a',
        lineHeight: 1.6,
        maxWidth: 800,
        margin: '0 auto',
        padding: 40
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, paddingBottom: 30, borderBottom: '2px solid #e5e7eb' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: -0.5 }}>
            Comply<span style={{ color: '#2563EB' }}>zo</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '16px 0 8px', color: '#111827' }}>
            Combined Scan Report
          </div>
          <div style={{ fontSize: 15, color: '#6b7280' }}>{websiteUrl}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
            {scanHistory.length} scans • Generated {formatDate(new Date())}
          </div>
        </div>

        {/* Scan Entries */}
        {scanHistory.map((scan, index) => {
          const overall = getOverallScore(scan);
          return (
            <div key={index} style={{
              margin: '32px 0',
              padding: 24,
              background: '#f9fafb',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              pageBreakInside: 'avoid'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#2563EB' }}>
                    Scan #{scanHistory.length - index}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(scan.createdAt)}</div>
                </div>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700,
                  background: overall >= 80 ? '#ecfdf5' : overall >= 60 ? '#fffbeb' : '#fef2f2',
                  color: overall >= 80 ? '#059669' : overall >= 60 ? '#d97706' : '#dc2626',
                  border: `3px solid ${overall >= 80 ? '#059669' : overall >= 60 ? '#d97706' : '#dc2626'}`
                }}>
                  {overall}
                </div>
              </div>

              {/* Scores Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'SEO', score: scan.seoScore, color: '#3B82F6' },
                  { label: 'Security', score: scan.securityScore, color: '#10B981' },
                  { label: 'Compliance', score: scan.complianceScore, color: '#F59E0B' },
                  { label: 'Performance', score: scan.performanceScore, color: '#8B5CF6' }
                ].map(s => (
                  <div key={s.label} style={{
                    textAlign: 'center', padding: '16px 12px',
                    background: '#fff', borderRadius: 8,
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.score}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Issues Found ({scan.issues?.length || 0})
              </div>
              {scan.issues?.slice(0, 5).map((issue, i) => (
                <div key={i} style={{
                  padding: '8px 12px', margin: '6px 0',
                  borderLeft: '3px solid', borderRadius: 4,
                  background: issue.severity === 'Critical' ? '#fef2f2' : issue.severity === 'Warning' ? '#fffbeb' : '#eff6ff',
                  borderColor: issue.severity === 'Critical' ? '#dc2626' : issue.severity === 'Warning' ? '#d97706' : '#3b82f6',
                  fontSize: 13
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                    marginRight: 8, textTransform: 'uppercase',
                    background: issue.severity === 'Critical' ? '#dc2626' : issue.severity === 'Warning' ? '#d97706' : '#3b82f6',
                    color: '#fff'
                  }}>{issue.severity}</span>
                  {issue.message}
                </div>
              ))}
              {scan.issues?.length > 5 && (
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  +{scan.issues.length - 5} more issues
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          marginTop: 48, paddingTop: 20, textAlign: 'center',
          borderTop: '1px solid #e5e7eb', fontSize: 12, color: '#9ca3af'
        }}>
          <p>Generated by Complyzo - AI Website Monitor</p>
          <p style={{ marginTop: 4 }}>https://getcomplyzo.com</p>
        </div>
      </div>
    );
  }

  // Single Report
  const overall = getOverallScore(scan);
  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      color: '#1a1a1a',
      lineHeight: 1.6,
      maxWidth: 800,
      margin: '0 auto',
      padding: 40
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40, paddingBottom: 30, borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: -0.5 }}>
          Comply<span style={{ color: '#2563EB' }}>zo</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, margin: '16px 0 8px', color: '#111827' }}>
          Website Scan Report
        </div>
        <div style={{ fontSize: 15, color: '#6b7280' }}>{websiteUrl}</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
          Scan Date: {formatDate(scan.createdAt)}
        </div>
        
        {/* Overall Score Circle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700,
            background: overall >= 80 ? '#ecfdf5' : overall >= 60 ? '#fffbeb' : '#fef2f2',
            color: overall >= 80 ? '#059669' : overall >= 60 ? '#d97706' : '#dc2626',
            border: `3px solid ${overall >= 80 ? '#059669' : overall >= 60 ? '#d97706' : '#dc2626'}`
          }}>
            {overall}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>Overall<br/>Score</div>
        </div>
      </div>

      {/* Scores Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, margin: '32px 0' }}>
        {[
          { label: 'SEO', score: scan.seoScore, color: '#3B82F6' },
          { label: 'Security', score: scan.securityScore, color: '#10B981' },
          { label: 'Compliance', score: scan.complianceScore, color: '#F59E0B' },
          { label: 'Performance', score: scan.performanceScore, color: '#8B5CF6' }
        ].map(s => (
          <div key={s.label} style={{
            textAlign: 'center', padding: '20px 12px',
            background: '#f9fafb', borderRadius: 12,
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.score}</div>
            <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Issues Section */}
      <div style={{ margin: '32px 0' }}>
        <div style={{
          fontSize: 18, fontWeight: 600, marginBottom: 16,
          paddingBottom: 8, borderBottom: '1px solid #e5e7eb'
        }}>
          Issues Found ({scan.issues?.length || 0})
        </div>

        {scan.issues?.map((issue, i) => (
          <div key={i} style={{
            padding: 14, margin: '10px 0',
            borderRadius: 8, borderLeft: '3px solid',
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: issue.severity === 'Critical' ? '#fef2f2' : issue.severity === 'Warning' ? '#fffbeb' : '#eff6ff',
            borderColor: issue.severity === 'Critical' ? '#dc2626' : issue.severity === 'Warning' ? '#d97706' : '#3b82f6'
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px',
              borderRadius: 100, textTransform: 'uppercase',
              background: issue.severity === 'Critical' ? '#dc2626' : issue.severity === 'Warning' ? '#d97706' : '#3b82f6',
              color: '#fff', flexShrink: 0, marginTop: 2
            }}>{issue.severity}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{issue.message}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{issue.type}</div>
            </div>
          </div>
        ))}

        {(!scan.issues || scan.issues.length === 0) && (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
            ✅ No issues found! Your website is in great shape.
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        margin: '32px 0', padding: 20, background: '#f9fafb',
        borderRadius: 12, border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{scan.issues?.filter(i => i.severity === 'Critical').length || 0}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Critical</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{scan.issues?.filter(i => i.severity === 'Warning').length || 0}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Warnings</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{scan.issues?.length || 0}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Total</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 48, paddingTop: 20, textAlign: 'center',
        borderTop: '1px solid #e5e7eb', fontSize: 12, color: '#9ca3af'
      }}>
        <p>Generated by Complyzo - AI Website Monitor</p>
        <p style={{ marginTop: 4 }}>https://getcomplyzo.com</p>
      </div>
    </div>
  );
};

export default ReportPDF;