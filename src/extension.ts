import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	let enabled = true;
	let timeout: NodeJS.Timer | undefined = undefined;

	const label = vscode.window.createTextEditorDecorationType({
		color : "black",
		backgroundColor: { id: 'labelInLine.labelBackground' }
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {

		if (!activeEditor) {
				return;
		}

		let regEx = /\/\/ ?\-\-\-\-*> *([a-zA-Z0-9]* *)*/g;
		let ext = activeEditor.document.fileName.split('.');
		
		switch (ext[ext.length-1])
		{
			case "py":
				regEx = /# ?\-\-\-\-*> *([a-zA-Z0-9]* *)*/g;
				break;
				
			case "php":
				if(ext[ext.length-2] == "blade")
				{
					regEx = /\{\{\-\-\-+> *([a-zA-Z0-9] *)* *\-\-\}\}|\/\/ ?\-\-\-\-*> *([a-zA-Z0-9]* *)*/g;
				}
				break;
			
			case "html":
				regEx = /\<\!\-\-\-+: *([a-zA-Z0-9] *)* *\-\-\>|\/\/ ?\-\-\-\-*> *([a-zA-Z0-9]* *)*/g;
				break;
		}

		// vscode.window.showInformationMessage("Regex:"+regEx);

		const text = activeEditor.document.getText();
		const labelInEditor: vscode.DecorationOptions[] = [];
		let match;
		while (match = regEx.exec(text)) {
			
			let start = match.index;
			let end = match.index + match[0].length;
			
			if(!enabled)
			{
				start = end = 0;
			}

			const startPos = activeEditor.document.positionAt(start);
			const endPos = activeEditor.document.positionAt(end);
			
			const decoration = { range: new vscode.Range(startPos, endPos)};
			labelInEditor.push(decoration);
		}

		activeEditor.setDecorations(label, labelInEditor);
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	// register commands
	let disposable = vscode.commands.registerCommand('labelInLine.toggle', () => {

		enabled = !enabled; 
		updateDecorations();
	});

	context.subscriptions.push(disposable);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

}

