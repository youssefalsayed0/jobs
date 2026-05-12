export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  /** Assistant row while tokens are still streaming */
  isStreaming?: boolean
}
