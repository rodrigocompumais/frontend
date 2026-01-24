# Nova Interface de Cards - Estrutura

## Grid de Cards (Tela Principal)
- Exibir todos os templates (incluindo "Personalizado") como cards
- Cada card mostra: ícone, nome, descrição
- Card selecionado tem destaque visual
- Ao clicar, atualiza `selectedTemplate`

## Quando um template é selecionado:

### Se for "Personalizado":
- Mostrar formulário completo tradicional
- Nome, Prompt, Provider, Model, etc.
- Checkboxes de permissões

### Se for template pré-definido:
- Campos de variáveis (nome_agente, tom_resposta, observacoes)
- Provider e Model
- **Permissões editáveis com checkboxes** (inicializadas com valores do template)
- Preview do prompt base

## Fluxo:
1. Modal abre → Grid de cards
2. Usuário clica em um card → Card fica selecionado
3. Formulário específico aparece abaixo
4. Usuário preenche e salva
