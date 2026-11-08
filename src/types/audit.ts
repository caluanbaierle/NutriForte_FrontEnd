export type AuditAction =
  | 'CREATE_PLAN'
  | 'UPDATE_PLAN'
  | 'ACTIVATE_PLAN'
  | 'DEACTIVATE_PLAN'
  | 'CREATE_NUTRITIONIST'
  | 'CREATE_LINK'
  | 'DISABLE_LINK'
  | 'CONFIRM_PAYMENT'
  | 'CREATE_NUTRITION_PLAN'
  | 'CREATE_VO2_ASSESSMENT'
  | 'CREATE_LIPID_ASSESSMENT'
  | 'SET_ENERGY_TARGET'

export type AuditResourceType =
  | 'PLAN'
  | 'NUTRITIONIST'
  | 'NUTRITIONIST_PATIENT_LINK'
  | 'PAYMENT'
  | 'NUTRITION_PLAN'
  | 'PATIENT'

export type AuditResult = 'SUCCESS' | 'FAILURE'

export interface AuditLogResponse {
  id: string
  actorUserId: string
  actorName?: string | null
  actorEmail?: string | null
  action: AuditAction
  resourceType: AuditResourceType
  resourceId?: string | null
  result: AuditResult
  createdAt: string
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE_PLAN: 'Criar plano',
  UPDATE_PLAN: 'Atualizar plano',
  ACTIVATE_PLAN: 'Ativar plano',
  DEACTIVATE_PLAN: 'Desativar plano',
  CREATE_NUTRITIONIST: 'Criar nutricionista',
  CREATE_LINK: 'Criar vínculo',
  DISABLE_LINK: 'Desativar vínculo',
  CONFIRM_PAYMENT: 'Confirmar pagamento',
  CREATE_NUTRITION_PLAN: 'Publicar plano alimentar',
  CREATE_VO2_ASSESSMENT: 'Registrar teste de VO₂',
  CREATE_LIPID_ASSESSMENT: 'Registrar perfil lipídico',
  SET_ENERGY_TARGET: 'Definir kcal/kg do paciente',
}

export const AUDIT_RESOURCE_LABELS: Record<AuditResourceType, string> = {
  PLAN: 'Plano de assinatura',
  NUTRITIONIST: 'Nutricionista',
  NUTRITIONIST_PATIENT_LINK: 'Vínculo',
  PAYMENT: 'Pagamento',
  NUTRITION_PLAN: 'Plano alimentar',
  PATIENT: 'Paciente',
}

export const AUDIT_RESULT_LABELS: Record<AuditResult, string> = {
  SUCCESS: 'Sucesso',
  FAILURE: 'Falha',
}
