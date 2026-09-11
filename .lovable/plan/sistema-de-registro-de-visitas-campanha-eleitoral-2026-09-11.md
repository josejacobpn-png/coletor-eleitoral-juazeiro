# Sistema de Registro de Visitas — Campanha Eleitoral

App mobile-first para registrar visitas porta a porta com intenção de voto, mais um painel com estatísticas e histórico.

## Telas

### 1. Registrar visita (página inicial, `/`)
Formulário otimizado para celular, campos grandes, poucos toques:
- **Presidente**: botões 13 / 22 / Outro (Outro abre campo de texto para nome ou número)
- **Governador**: 13 / 45 / Outro (+ campo de texto)
- **Deputado Federal**: F. Santana / Yuri do Paredão / André Figueiredo / Fernanda Pessoa / Outro (+ campo)
- **Deputado Estadual**: Zé Ailton / Giovane Sampaio / Felipe Vasques / Outro (+ campo)
- **Data e hora**: preenchida automaticamente com o momento atual, editável
- **Bairro ou localidade**: campo com sugestões dos bairros já usados
- **Nome do eleitor/responsável**: opcional
- **Observações**: texto livre
- Botão fixo no rodapé "Salvar visita", confirmação rápida e formulário limpo para o próximo registro

### 2. Painel (`/painel`)
- Cartões com totais: visitas registradas, visitas hoje, bairros alcançados
- Gráfico de pizza para Presidente e para Governador
- Gráfico de barras para Deputado Federal e Deputado Estadual
- Gráfico de barras com visitas por bairro
- Cada gráfico mostra número e percentual

### 3. Histórico (`/historico`)
- Tabela com data/hora, bairro, eleitor e as quatro escolhas
- Filtros: período (data inicial e final), bairro e candidato
- Em telas pequenas vira lista de cartões
- Botão para excluir um registro feito por engano

## Dados

Ativar o Lovable Cloud para guardar as visitas de forma permanente (banco de dados + login). As visitas ficam ligadas a quem as registrou, e cada pessoa vê apenas os próprios registros. Tela de entrada com e-mail e senha.

## Detalhes técnicos

- Tabela `visits`: `id`, `user_id`, `visited_at`, `neighborhood`, `voter_name`, `notes`, e para cada cargo um par de colunas `*_choice` (valor pré-definido ou `outro`) e `*_other` (texto livre). RLS por `auth.uid()` mais os GRANTs necessários.
- Leitura e escrita via `createServerFn` com `requireSupabaseAuth`; rotas do app sob `_authenticated/`, exceto `/auth`.
- Gráficos com Recharts; validação de formulário com Zod; datas em pt-BR.
- Visual próprio (paleta e tipografia definidas em `src/styles.css`), sem cara de template genérico.
