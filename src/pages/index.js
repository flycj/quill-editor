import React, {useCallback, useEffect} from 'react'
import Quill from 'Editor/quill'
import './index.scss'
import 'Editor/assets/snow.scss'

const defaultToolbar = [
	['bold', 'blockquote', { 'script': 'sub'}, { 'script': 'super' }, { 'list': 'ordered'}, { 'list': 'bullet' }],        // toggled buttons
	[{ 'size': []}, { 'color': [] }, { 'align': [] }, {'lineheight': []}],  // custom dropdown
	['link','video','image','divider'],
  	['clean']
]

// const defaultToolbar = [
// 	[{ 'size': [] }],
// 	[ 'bold', 'italic', 'underline', 'strike' ],
// 	[{ 'color': [] }, { 'background': [] }],
// 	[{ 'script': 'super' }, { 'script': 'sub' }],
// 	[{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
// 	[{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
// 	[ {'direction': 'rtl'}, { 'align': [] }],
// 	[ 'link', 'image', 'video', 'formula' ],
// 	[ 'clean' ]
// ]
Index.defaultProps = {
	toolbar: {
	},
	id: 'editor',
	customDecorators: [],
	readOnly: false,
	onChange: () => {}
}
export default function Index(props) {
	const {id, onChange, value, defaultValue, wraperProps, ...restProps} = props;
	const editor = React.useRef(null);
	const toolbarRef = React.useRef(null);
	const initEditor = useCallback((id) => {
		editor.current = new Quill(`#${id}`, {
			modules: {
				toolbar: defaultToolbar
			},
			placeholder: '请输入内容...',
			formats: [
				'bold',
				// 'header',
				// 'italic',
				// 'link',
				// 'list',
				'blockquote',
				// 'image',
				'indent'
			],
			scrollingContainer: document.documentElement,
			theme: 'snow'
		})
		editor.current.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
			let ops = []
			delta.ops.forEach(op => {
				if (op.insert && typeof op.insert === 'string') {
				ops.push({
					insert: op.insert
				})
				}
			})
			delta.ops = ops
			return delta
		})
		console.log('editor.current', editor.current);
		// let toolbar = editor.current.getModule('toolbar');
		// toolbar.addHandler('image', function(res) {
		// 	console.log('handle image', res);
		// })
		// console.log('editor.current', editor.current)
	}, [])

	useEffect(() => {
		initEditor(id)
	}, [id])

	return <div className="page">
		<div ref={toolbarRef} className="tool">ToolBar</div>
		<div className="editor-container" id={id}></div>
	</div>
}