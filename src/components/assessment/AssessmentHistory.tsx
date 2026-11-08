import type { AssessmentHistoryResponse } from '@/types/assessment'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime, formatNumber } from '@/utils/format'

/**
 * Histórico de testes de VO₂ (Rockport) e perfis lipídicos. Os valores de referência de Castelli
 * são os da planilha da Clínica e aparecem sem classificação: a planilha não define critérios de interpretação.
 */
export function AssessmentHistory({ history }: { history: AssessmentHistoryResponse }) {
  return (
    <div className="space-y-4">
      <div className="nf-card">
        <h3 className="font-display text-lg text-forest">VO₂máx — teste de caminhada de 1 milha (Rockport)</h3>
        <p className="mt-1 text-xs text-charcoal-muted">
          Fórmula da planilha: 132,6 − 0,17·peso − 0,39·idade + 6,31·sexo − 3,27·tempo − 0,156·FC. Resultado sem
          interpretação.
        </p>
        {history.vo2.length === 0 ? (
          <EmptyState title="Nenhum teste registrado" />
        ) : (
          <div className="nf-table-wrap mt-3">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Idade</th>
                  <th>Peso (kg)</th>
                  <th>Tempo (min)</th>
                  <th>FC (bpm)</th>
                  <th>VO₂máx</th>
                </tr>
              </thead>
              <tbody>
                {history.vo2.map((v) => (
                  <tr key={v.id}>
                    <td>{formatDateTime(v.createdAt)}</td>
                    <td>{v.ageYears}</td>
                    <td>{formatNumber(v.weightKg, 2)}</td>
                    <td>{formatNumber(v.mileMinutes, 2)}</td>
                    <td>{v.heartRateBpm}</td>
                    <td className="font-semibold">{formatNumber(v.vo2Max, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="nf-card">
        <h3 className="font-display text-lg text-forest">Perfil lipídico — índices de Castelli</h3>
        <p className="mt-1 text-xs text-charcoal-muted">
          Castelli I = CT ÷ HDL · Castelli II = LDL ÷ HDL · LDL estimado = CT − HDL − TG ÷ 5. Referência = valor da
          planilha para o sexo do paciente, exibido sem classificação. Não é diagnóstico.
        </p>
        {history.lipids.length === 0 ? (
          <EmptyState title="Nenhum perfil registrado" />
        ) : (
          <div className="nf-table-wrap mt-3">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>CT</th>
                  <th>HDL</th>
                  <th>LDL</th>
                  <th>TG</th>
                  <th>Castelli I (ref.)</th>
                  <th>Castelli II (ref.)</th>
                  <th>LDL estimado</th>
                </tr>
              </thead>
              <tbody>
                {history.lipids.map((l) => (
                  <tr key={l.id}>
                    <td>{formatDateTime(l.createdAt)}</td>
                    <td>{formatNumber(l.totalCholesterol, 2)}</td>
                    <td>{formatNumber(l.hdl, 2)}</td>
                    <td>{formatNumber(l.ldl, 2)}</td>
                    <td>{formatNumber(l.triglycerides, 2)}</td>
                    <td>
                      <span className="font-semibold">{formatNumber(l.castelliI, 2)}</span> (
                      {formatNumber(l.castelliIReference, 1)})
                    </td>
                    <td>
                      <span className="font-semibold">{formatNumber(l.castelliII, 2)}</span> (
                      {formatNumber(l.castelliIIReference, 1)})
                    </td>
                    <td>{formatNumber(l.estimatedLdl, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
