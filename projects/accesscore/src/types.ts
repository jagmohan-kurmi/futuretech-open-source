export interface PolicyRule {
  resource: string;
  action: string;
  tenant?: string;
  allow: boolean;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
}

export interface RoleDefinition {
  name: string;
  permissions: string[];
  inheritedRoles?: string[];
}
