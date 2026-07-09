import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { roleLabels } from "@/lib/roles";
import type { PermissionNote } from "@/types/role";

export function RoleCard({ rule }: { rule: PermissionNote }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{roleLabels[rule.role]}</p>
            <p className="mt-1 text-xs font-medium text-primary">{rule.title}</p>
          </div>
          <Badge variant="primary">Rol</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{rule.description}</p>
      </CardContent>
    </Card>
  );
}
