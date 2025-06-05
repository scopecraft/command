export async function mockAiAction(content: string, action: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return `AI ${action} result for: ${content.substring(0, 50)}...`
}
