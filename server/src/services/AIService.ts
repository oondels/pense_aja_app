import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "../config/dotenv"

const genAI = new GoogleGenerativeAI(dotenv.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

if (!dotenv.GEMINI_API_KEY) {
  throw new Error("Chave da API do Gemini não está definida. Verifique as variáveis de ambiente.")
}

const AIService = {
  sanatizeEntry(entry: string) {
    return entry.replace(/[`$\\]/g, '')
  },

  parseAIResponse(response: string): { before: string; after: string } {
    const [beforePart, afterPart] = response?.replace(/^Antes:\s*/i, '').split(/-\s*\n?\n?Depois:\s*/i);

    return {
      before: beforePart.trim(),
      after: afterPart.trim(),
    };
  },

  async improveText(projectName: string, situationBefore: string, situationNow: string) {
    let prompt = `Descreva a situação antes e depois da melhoria, de forma clara e objetiva, 
    para facilitar o entendimento dos avaliadores.`

    prompt += `
    Nome: ${this.sanatizeEntry(projectName)}
    Antes: ${this.sanatizeEntry(situationBefore)}, 
    Atual: ${this.sanatizeEntry(situationNow)}. 
    OBS: não quero formatação da resposta, separe o antes e depois com '-'`

    const { totalTokens } = await model.countTokens(prompt)

    if (totalTokens > 3000) {
      throw new Error("Texto muito grande, reduza para que a Inteligência Artificial avalie.")
    }

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    if (!response) throw new Error("Erro ao melhorar texto pense aja. Tente novamente mais tarde.")

    return this.parseAIResponse(response)
  },

  async resumeText(projectName: string, situationBefore: string, situationNow: string) {
    let prompt = `Resuma a situação antes e depois da melhoria, de forma clara e objetiva, 
    para facilitar o entendimento dos avaliadores.`

    prompt += `
    Nome: ${this.sanatizeEntry(projectName)}
    Antes: ${this.sanatizeEntry(situationBefore)}, 
    Atual: ${this.sanatizeEntry(situationNow)}. 
    OBS: não quero formatação da resposta, quero um texto corrido para facilitar a leitura. Não precisa ser grande.`

    const { totalTokens } = await model.countTokens(prompt)

    if (totalTokens > 3000) {
      throw new Error("Texto muito grande, reduza para que a Inteligência Artificial avalie.")
    }

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    if (!response) throw new Error("Erro ao resumir texto pense aja. Tente novamente mais tarde.")

    return this.parseAIResponse(response)
  }
}

export default AIService;