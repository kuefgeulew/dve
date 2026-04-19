import { PageTransition } from '../App';
import { ALL_RULES } from '../engine/RuleRegistry';
import { Button } from '../components/common/Button';
import { RuleToggleList } from '../components/dashboard/RuleToggleList';
import { useRuleStore } from '../store/ruleStore';

export default function RuleManagerScreen() {
  const enableAll = useRuleStore((state) => state.enableAll);
  const disableAll = useRuleStore((state) => state.disableAll);

  return (
    <PageTransition>
      <div style={{ height: '100%', background: 'var(--brand-dark)', position: 'relative' }}>
        <div
          style={{
            padding: '12px 14px 88px',
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="ghost" size="sm" fullWidth onClick={enableAll}>
              Enable All
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={disableAll}>
              Disable All
            </Button>
          </div>
          <RuleToggleList rules={ALL_RULES} />
        </div>
      </div>
    </PageTransition>
  );
}
