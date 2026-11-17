import type { AccessDecision, PolicyRule, RoleDefinition } from './types';

export class AccessCore {
  private roles = new Map<string, RoleDefinition>();
  private policyRules: PolicyRule[] = [];

  addRole(name: string, permissions: string[], inheritedRoles: string[] = []): void {
    this.roles.set(name, { name, permissions, inheritedRoles });
  }

  addPolicyRule(rule: PolicyRule): void {
    this.policyRules.push(rule);
  }

  authorize(userRole: string, action: string, resource: string, tenant?: string): AccessDecision {
    const role = this.roles.get(userRole);
    if (!role) return { allowed: false, reason: 'Role is not recognized.' };

    const inherited = new Set<string>(role.permissions);
    for (const inheritedRole of role.inheritedRoles ?? []) {
      const parent = this.roles.get(inheritedRole);
      if (parent) for (const permission of parent.permissions) inherited.add(permission);
    }

    const matchingRule = this.policyRules.find((rule) => rule.resource === resource && rule.action === action && (rule.tenant ? rule.tenant === tenant : true));
    if (matchingRule && !matchingRule.allow) {
      return { allowed: false, reason: `Explicit policy blocked ${action} on ${resource}.` };
    }

    if (inherited.has(action) || inherited.has(`${resource}:${action}`)) {
      return { allowed: true, reason: 'Role permission satisfied by inheritance or direct grant.' };
    }

    return { allowed: false, reason: 'Default deny: the requested action is not permitted.' };
  }
}
