import { useEffect, useState, type FormEvent } from 'react'
import { patientApi } from '@/api/patientApi'
import type { PatientRequest, Sex } from '@/types/patient'
import { BRAZIL_STATES, SEX_LABELS } from '@/types/patient'
import { PageHeader } from '@/components/common/PageHeader'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { getErrorMessage } from '@/utils/errors'

const empty: PatientRequest = {
  fullName: '',
  cpf: '',
  birthDate: '',
  sex: 'FEMALE',
  whatsapp: '',
  city: '',
  state: 'SP',
}

export function PatientProfilePage() {
  const [form, setForm] = useState<PatientRequest>(empty)
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const me = await patientApi.getMe()
        setExists(true)
        setForm({
          fullName: me.fullName,
          cpf: me.cpf,
          birthDate: me.birthDate,
          sex: me.sex,
          whatsapp: me.whatsapp,
          city: me.city,
          state: me.state,
        })
      } catch {
        setExists(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      if (exists) {
        await patientApi.updateMe(form)
        setSuccess('Perfil atualizado.')
      } else {
        await patientApi.create(form)
        setExists(true)
        setSuccess('Perfil criado.')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="nf-page">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="nf-page">
      <PageHeader
        title="Meu perfil"
        description={exists ? 'Atualize seus dados cadastrais.' : 'Complete seu cadastro de paciente.'}
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />
      <form onSubmit={handleSubmit} className="nf-card grid gap-3 md:grid-cols-2">
        <TextField
          label="Nome completo"
          required
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
        <TextField
          label="CPF"
          required
          value={form.cpf}
          onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
        />
        <TextField
          label="Data de nascimento"
          type="date"
          required
          value={form.birthDate}
          onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
        />
        <SelectField
          label="Sexo"
          required
          value={form.sex}
          onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as Sex }))}
          options={Object.entries(SEX_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextField
          label="WhatsApp"
          required
          value={form.whatsapp}
          onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
        />
        <TextField
          label="Cidade"
          required
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
        <SelectField
          label="Estado"
          required
          value={form.state}
          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          options={BRAZIL_STATES.map((uf) => ({ value: uf, label: uf }))}
        />
        <div className="md:col-span-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : exists ? 'Atualizar perfil' : 'Criar perfil'}
          </Button>
        </div>
      </form>
    </div>
  )
}
