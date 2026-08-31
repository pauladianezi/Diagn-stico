# Como instalar e rodar o Grenah Diagnóstico

## Pré-requisitos

### 1. Instalar Node.js
Acesse https://nodejs.org e baixe a versão **LTS** (recomendada).
Siga o instalador. Após instalar, abra o terminal e confirme:
```
node --version   # deve mostrar v20.x ou superior
npm --version    # deve mostrar 10.x ou superior
```

### 2. Chave de API da Anthropic
Acesse https://console.anthropic.com e crie uma conta.
Gere uma chave de API (começa com `sk-ant-`).
Você vai inserir essa chave no próprio app — não precisa configurar arquivo.

---

## Rodar localmente

1. Abra o terminal na pasta `grenah-diagnostico`
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   npm run dev
   ```
4. Abra no navegador: **http://localhost:3000**
5. Na primeira vez, o app vai pedir sua chave de API Anthropic

---

## Deploy na Vercel (online)

1. Crie conta em https://vercel.com (grátis)
2. Instale a CLI: `npm install -g vercel`
3. Na pasta do projeto, rode: `vercel`
4. Siga as instruções. Na Vercel, vá em Settings > Environment Variables e adicione:
   - `ANTHROPIC_API_KEY` = sua chave sk-ant-...
5. Faça redeploy após adicionar a variável

---

## Observações

- O app salva os diagnósticos no navegador (localStorage) — não precisa de banco de dados
- A chave de API pode ser inserida direto no app (campo na tela inicial) ou via variável de ambiente na Vercel
- Cada geração de diagnóstico completa consome ~$0.10–0.30 da API Anthropic (Claude Opus)
- O arquivo .docx é gerado e baixado automaticamente pelo navegador
