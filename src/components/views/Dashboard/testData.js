const testData = {
	tasks: {
		'task-1': { id: 'task-1', title: 'Task 1', content: 'Wash Dishes'},
		'task-2': { id: 'task-2', title: 'Task 2', content: 'Take out trash'},
		'task-3': { id: 'task-3', title: 'Task 3', content: 'Clean Car'},
	},
	columns: {
		'column-1': {
			id: 'column-1',
			title: 'To Dos',
			taskIds: ['task-1', 'task-2', 'task-3']
		}
	},
	columnOrder: ['column-1']
}

export default testData;