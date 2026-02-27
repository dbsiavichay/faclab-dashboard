import Notification from '@/components/ui/Notification'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import { themeConfig } from '@/configs/theme.config'
import { useThemeStore } from '@/stores'

const CopyButton = () => {
    const theme = useThemeStore()

    const handleCopy = () => {
        const config = {
            ...themeConfig,
            ...theme,
            layout: {
                type: theme.layout.type,
                sideNavCollapse: theme.layout.sideNavCollapse,
            },
            panelExpand: false,
        }

        navigator.clipboard.writeText(JSON.stringify(config, null, 2))

        toast.push(
            <Notification title="Copy Success" type="success">
                {`Please replace themeConfig in 'src/configs/themeConfig.js'`}
            </Notification>,
            {
                placement: 'top-center',
            }
        )
    }

    return (
        <Button block variant="solid" onClick={handleCopy}>
            Copy config
        </Button>
    )
}

export default CopyButton
