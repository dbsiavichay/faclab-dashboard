import { ComponentProps } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import type { Ref } from 'react'

type RichTextEditorProps = ComponentProps<typeof ReactQuill> & {
    ref?: Ref<RichTextEditorRef>
}

export type RichTextEditorRef = ReactQuill

const RichTextEditor = (props: RichTextEditorProps) => {
    const { ref, ...rest } = props
    return (
        <div className="rich-text-editor">
            <ReactQuill ref={ref} {...rest} />
        </div>
    )
}

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
