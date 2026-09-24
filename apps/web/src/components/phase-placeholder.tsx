import { Card, CardContent } from '@code-lift/ui/card';

/**
 * Honest stub for a screen a later phase will build.
 *
 * Named after the phase so the app never pretends a feature exists.
 */
export function PhasePlaceholder({
  phase,
  what,
}: {
  phase: string;
  what: string;
}): React.ReactElement {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            {what} arrives in <span className="font-medium text-[var(--foreground)]">{phase}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
