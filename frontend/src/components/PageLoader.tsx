import React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

export function PageLoader() {
  const { t } = useTranslation()

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ovacare-gray"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-ovacare-purple" aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  )
}
