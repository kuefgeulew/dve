import { PageTransition } from '../App';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SeverityBadge } from '../components/validation/SeverityBadge';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { StpGauge } from '../components/dashboard/StpGauge';
import { TopErrorsChart } from '../components/dashboard/TopErrorsChart';
import { useErrorLog } from '../hooks/useErrorLog';

export default function DashboardScreen() {
  const { stats, topErrors, recentEntries, evolutionRecommendations } = useErrorLog();

  return (
    <PageTransition>
      <div style={{ height: '100%', background: 'var(--brand-dark)', position: 'relative' }}>
        <div
          style={{
            padding: '12px 14px 88px',
            display: 'grid',
            gap: 14,
          }}
        >
          {/* StatsGrid: totalDocumentsProcessed, totalWarningsTriggered, stpRate, proceedWithWarningsRate via useCountUp */}
          <section style={{ display: 'grid', gap: 8 }}>
            <h3 style={{ fontSize: 14 }}>Stats</h3>
            <StatsGrid stats={stats} />
          </section>

          <TopErrorsChart topErrors={topErrors} />

          <section style={{ display: 'grid', gap: 8 }}>
            <h3 style={{ fontSize: 14 }}>Straight Through Processing</h3>
            <StpGauge stpRate={stats.stpRate} />
          </section>

          <RecentActivityList entries={recentEntries} />

          <section style={{ display: 'grid', gap: 10 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-heading)' }}>Evolution Recommendations</h3>
            {evolutionRecommendations.map((rec) => (
              <div
                key={rec.proposedRuleId}
                style={{
                  background: 'var(--brand-surface-2)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Badge
                    style={{
                      color: '#fff',
                      background: 'var(--brand-primary)',
                      border: '1px solid var(--brand-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {`#${rec.priority}`}
                  </Badge>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)' }}>
                    {rec.proposedRuleId}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {rec.rationale}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge style={{ background: 'var(--brand-surface-3)' }}>{`Est. frequency: ~${rec.estimatedFrequency}/mo`}</Badge>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Impact</span>
                    <SeverityBadge severity={rec.estimatedImpact} />
                    <Badge style={{ background: 'var(--brand-surface-3)' }}>{`Phase ${rec.phase}`}</Badge>
                    <Badge
                      style={{
                        color:
                          rec.status === 'PROPOSED'
                            ? '#9ca3af'
                            : rec.status === 'IN_REVIEW'
                              ? 'var(--severity-medium)'
                              : rec.status === 'APPROVED'
                                ? 'var(--severity-low)'
                                : 'var(--status-pass)',
                        background:
                          rec.status === 'PROPOSED'
                            ? 'rgba(156, 163, 175, 0.15)'
                            : rec.status === 'IN_REVIEW'
                              ? 'var(--severity-medium-bg)'
                              : rec.status === 'APPROVED'
                                ? 'var(--severity-low-bg)'
                                : 'var(--status-pass-bg)',
                        border:
                          rec.status === 'PROPOSED'
                            ? '1px solid rgba(156, 163, 175, 0.4)'
                            : rec.status === 'IN_REVIEW'
                              ? '1px solid var(--severity-medium-border)'
                              : rec.status === 'APPROVED'
                                ? '1px solid var(--severity-low-border)'
                                : '1px solid var(--status-pass-border)',
                      }}
                    >
                      {rec.status}
                    </Badge>
                  </div>
                  {rec.status === 'PROPOSED' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.alert('Submitted. Pending review.');
                      }}
                    >
                      Submit for Review
                    </Button>
                  ) : rec.status === 'IN_REVIEW' ? (
                    <span title="Backend required">
                      <Button variant="ghost" size="sm" disabled>
                        View Review Thread
                      </Button>
                    </span>
                  ) : rec.status === 'APPROVED' ? (
                    <span title="Backend required">
                      <Button variant="ghost" size="sm" disabled>
                        Schedule Deployment
                      </Button>
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

