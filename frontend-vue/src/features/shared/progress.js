function getTaskProgressWeight(status) {
  switch (status) {
    case 'DONE':
      return 100
    case 'IN_PROGRESS':
      return 50
    default:
      return 0
  }
}

export function calculateTaskCollectionProgress(tasks = []) {
  if (!tasks.length) {
    return 0
  }

  const totalProgress = tasks.reduce((sum, task) => sum + getTaskProgressWeight(task.status), 0)
  return Math.round(totalProgress / tasks.length)
}