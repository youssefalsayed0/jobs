import "@ai-sdk/google"

declare module "@ai-sdk/google" {
  interface GoogleGenerativeAIProviderSettings {
    /** Allow calling the API from the browser (required for Vite client-only apps). */
    dangerouslyAllowBrowser?: boolean
  }
}
