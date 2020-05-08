import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('Label in line is activated');

	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate large numbers
	const label = vscode.window.createTextEditorDecorationType({
		color : "black",
		backgroundColor: { id: 'labelInLine.labelBackground' }
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		let regEx = /\/\/ ?\-\-\-\-*> ?([a-zA-Z] ?)*/g;
		let ext = activeEditor.document.fileName.split('.').pop();
		
		var n = ["Banana", "Orange", "Apple", "Mango"].includes("Mango");
		switch (ext)
		{
			case "py":
				regEx = /# ?\-\-\-\-*> ?([a-zA-Z] ?)*/g;
				break;
		}

		const text = activeEditor.document.getText();
		const labelInEditor: vscode.DecorationOptions[] = [];
		let match;
		while (match = regEx.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos)};
			labelInEditor.push(decoration);
		}
		// activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
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

