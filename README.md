# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6b1d532f-94e1-4a89-8314-c33593caa94d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6b1d532f-94e1-4a89-8314-c33593caa94d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6b1d532f-94e1-4a89-8314-c33593caa94d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

## Deploy na Vercel

Este projeto já está preparado para deploy na Vercel como SPA (React Router) usando Vite.

O arquivo `vercel.json` contém:

- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- `framework`: `vite`
- `rewrites`: regra que direciona qualquer rota sem extensão para `index.html`, garantindo que o React Router funcione no refresh/links diretos.

### Via GitHub (recomendado)
1. Crie um repositório e faça push do código.
2. No painel da Vercel, clique em “Add New…” > “Project” e importe o repositório.
3. Confirme as configurações sugeridas. A Vercel detectará o `vercel.json` e fará o build automático.
4. Após o build, a prévia (Preview) e a URL de produção estarão disponíveis.

### Via Vercel CLI (Windows PowerShell)
1. Instale a CLI (opcional, apenas se quiser deploy manual):
	```powershell
	npm i -g vercel
	```
2. Dentro da pasta do projeto, autentique-se e faça o primeiro deploy:
	```powershell
	vercel
	```
	- Na primeira vez, a CLI vai perguntar o diretório de saída; responda `dist`.
3. Para promover para produção:
	```powershell
	vercel --prod
	```

Se for necessário definir variáveis de ambiente, configure-as em Project Settings > Environment Variables e rode um novo build/deploy.

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
