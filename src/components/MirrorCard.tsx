'use client';

import { AvailabilityChecker } from '@/components/DistributionCard/AvailabilityChecker';
import type { DistributionSummary } from '@/types/distribution';
import { Check, Copy, Info } from 'lucide-react';

export function MirrorCard({
  distribution,
  selected,
  onToggle,
  onCopy,
  onInspect,
  copied,
}: {
  distribution: DistributionSummary;
  selected: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onInspect: () => void;
  copied: boolean;
}) {
  const url = `https://${distribution.domainName}`;
  return (
    <li className={`mirror-card${selected ? ' is-selected' : ''}`}>
      <label className="mirror-identity">
        <input
          type="checkbox"
          aria-label={`Выбраць ${distribution.domainName || distribution.id}`}
          checked={selected}
          onChange={onToggle}
        />
        <span className="mirror-text">
          <span className="mirror-url" title={url}>
            <span className="mirror-scheme">https://</span>
            {distribution.domainName || 'Дамен рыхтуецца…'}
          </span>
          <span className="mirror-origin" title={distribution.origins.map((o) => o.domainName).join(', ')}>
            Крыніца: {distribution.origins.map((o) => o.domainName).join(', ') || 'Няма даных'}
            {!distribution.enabled ? ' · выключана' : distribution.status !== 'Deployed' ? ' · абнаўляецца' : ''}
          </span>
        </span>
      </label>
      <div className="mirror-tools">
        <button
          type="button"
          className="mirror-icon"
          disabled={!distribution.domainName}
          onClick={onCopy}
          aria-label={`Скапіяваць https://${distribution.domainName}`}
          title="Скапіяваць URL"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button
          type="button"
          className="mirror-icon"
          onClick={onInspect}
          aria-label={`Падрабязнасці: ${distribution.domainName || distribution.id}`}
          title="Падрабязнасці"
        >
          <Info size={16} />
        </button>
      </div>
      <AvailabilityChecker domain={distribution.domainName} />
    </li>
  );
}
