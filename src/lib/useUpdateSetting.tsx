import { useToasts } from '@geist-ui/core'
import useSWR, { useSWRConfig } from 'swr'
import { getValueOrDefault } from './DBSettings'
import { fetcher } from './fetcher'

export function useUpdateSetting(key) {
  const { data } = useSWR(`/api/settings/${key}`, fetcher)
  const loading = data === undefined
  const isEnabled = getValueOrDefault([data], key)

  const { setToast } = useToasts()
  const { mutate } = useSWRConfig()

  const updateSetting = (value) => {
    const setting = { ...data, value }
    const options = {
      optimisticData: setting,
      rollbackOnError: true,
    }

    let isNow = setting.value
    if (setting.value === true) isNow = 'enabled'
    if (setting.value === false) isNow = 'disabled'

    const updateFn = async (setting) => {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value: setting.value }),
      })
      setToast({
        text: response.ok
          ? `Updated! Setting is now ${isNow}`
          : 'Error updating',
        type: response.ok ? 'success' : 'error',
      })

      return setting
    }

    mutate(`/api/settings/${key}`, updateFn(setting), options)
  }

  return { isEnabled, loading, updateSetting }
}
