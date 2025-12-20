# Pacote de Redesign UI/UX - xFinance

Este documento contém todo o material necessário para o redesenho da interface do sistema xFinance no Replit.

---

## SEÇÃO 1 — Código do layout Dash isolado (pronto para Replit)

Copie e cole o código abaixo em um arquivo `main.py` no Replit. Este código é uma versão isolada do layout atual, sem dependências de banco de dados ou callbacks complexos, focado puramente na estrutura visual.

```python
import dash
from dash import html, dcc
import dash_ag_grid as dag
import plotly.graph_objects as go
from datetime import datetime

# ==============================================================================
# MOCKS E CONSTANTES (Para isolamento do Backend)
# ==============================================================================

COLORS = {
    "bg_primary": "#0A0A1F",
    "bg_secondary": "#1A1A3A",
    "surface_card": "#232347",
    "surface_card_glass": "rgba(26, 26, 58, 0.85)",
    "dark_bg": "#0A0A1F",
    "dark_card": "#232347",
    "dark_text": "#E0E0FF",
    "primary": "#CE62D9",
    "secondary": "#5B21B6",
    "success": "#34D399",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "accent_cyan": "#00BCD4",
}

LOGO_SRC = "/assets/img/logo_login.png"
MAIN_GRID_ROW_HEIGHT = 28
ROWS_PER_PAGE = 50

COLUMN_GROUP_OPTIONS = [
    {"label": "Work Flow", "value": "workflow"},
    {"label": "Recebíveis", "value": "recebiveis"},
    {"label": "Pagamentos", "value": "pagamentos"},
]
DEFAULT_COLUMN_GROUP_VALUES = ["workflow", "recebiveis", "pagamentos"]

def load_logo_src(path=None):
    return LOGO_SRC

def can_view(feature, session_user):
    # Mock: Permite visualização total para design
    return True

def get_display_name(field_name):
    return field_name.replace("_", " ").title()

def _empty_fig(message="Carregando..."):
    fig = go.Figure()
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis={"visible": False},
        yaxis={"visible": False},
        annotations=[{"text": message, "showarrow": False, "font": {"color": "white"}}]
    )
    return fig

# ==============================================================================
# COMPONENTES: TOOLBAR E PAINÉIS
# ==============================================================================

def create_toolbar_divider(reduced_height=False):
    height = "67px" if reduced_height else "100%"
    return html.Div(
        className="toolbar-divider",
        style={"width": "1px", "background": "rgba(255,255,255,0.1)", "height": height, "margin": "0 8px"}
    )

def create_welcome_panel(session_user=None):
    return html.Div(
        [
            html.Div("Olá, Usuário", style={"color": "#FFFFFF", "fontSize": "16px", "fontWeight": "bold", "lineHeight": "1.0"}),
            html.Div(
                [
                    html.Span(f"📅 {datetime.now().strftime('%d/%m/%Y')}", style={"color": "#CCCCCC", "fontSize": "14px", "marginRight": "12px"}),
                    html.Span(f"🕒 {datetime.now().strftime('%H:%M')}", style={"color": "#CCCCCC", "fontSize": "14px"}),
                ],
                style={"lineHeight": "1.0"}
            ),
            html.Div(
                [
                    html.Span("🌤️ 25°C", style={"color": "#87CEEB", "fontSize": "14px", "marginRight": "8px", "fontWeight": "bold"}),
                    html.Span("Ensolarado", style={"color": "#E0E0E0", "fontSize": "14px"}),
                ],
                style={"lineHeight": "1.0"}
            ),
        ],
        className="panel-card",
        style={
            "minWidth": "200px", "width": "300px", "height": "90px", "padding": "9px 16px",
            "display": "flex", "flexDirection": "column", "gap": "8px", "justifyContent": "center",
            "backgroundColor": COLORS["surface_card_glass"], "borderRadius": "8px"
        },
    )

def create_express_totals_panel():
    return html.Div(
        [
            html.Div(
                [
                    html.Span("EXPRESS 💰:", style={"color": "#FFFFFF", "fontSize": "16px", "fontWeight": "bold"}),
                    html.Span("R$ 15.450,00", id="et-express", style={"color": "#22C73D", "fontSize": "16px", "fontWeight": "bold"}),
                ],
                style={"marginBottom": "4px", "display": "flex", "gap": "8px"}
            ),
            html.Div(
                [
                    html.Span("Honorários: ", style={"color": "#E0E0E0", "fontSize": "14px"}),
                    html.Span("R$ 10.000,00", id="et-honor", style={"color": "#87CEEB", "fontSize": "14px", "fontWeight": "600"}),
                    html.Div(style={"width": "10px"}),
                    html.Span("GHonorários: ", style={"color": "#E0E0E0", "fontSize": "14px"}),
                    html.Span("R$ 2.000,00", id="et-ghonor", style={"color": COLORS["danger"], "fontSize": "14px", "fontWeight": "600"}),
                ],
                style={"display": "flex", "alignItems": "center"}
            ),
            html.Div(
                [
                    html.Span("Despesas: ", style={"color": "#E0E0E0", "fontSize": "14px"}),
                    html.Span("R$ 5.450,00", id="et-desp", style={"color": "#FACD6B", "fontSize": "14px", "fontWeight": "600"}),
                    html.Div(style={"width": "10px"}),
                    html.Span("GDespesas: ", style={"color": "#E0E0E0", "fontSize": "14px"}),
                    html.Span("R$ 500,00", id="et-gdesp", style={"color": COLORS["danger"], "fontSize": "14px", "fontWeight": "600"}),
                ],
                style={"display": "flex", "alignItems": "center"}
            ),
        ],
        className="toolbar-panel",
        style={
            "minWidth": "340px", "height": "90px", "padding": "9px 12px",
            "display": "flex", "flexDirection": "column", "justifyContent": "center",
            "backgroundColor": COLORS["surface_card_glass"], "borderRadius": "8px"
        },
    )

def create_radio_panel():
    return html.Div(
        [
            dcc.Checklist(
                id="player-toggle",
                options=[{"label": "🎮 Player", "value": "player"}],
                value=[],
                labelStyle={"display": "flex", "alignItems": "center", "color": "#FFFFFF", "fontSize": "14px", "fontWeight": "600", "gap": "6px"},
            ),
            dcc.Checklist(
                id="myjob-toggle",
                options=[{"label": "🎯 My Job", "value": "myjob"}],
                value=[],
                labelStyle={"display": "flex", "alignItems": "center", "color": "#FFFFFF", "fontSize": "14px", "fontWeight": "600", "gap": "6px"},
            ),
            html.Div(
                dcc.Checklist(
                    id="db-limit-toggle",
                    options=[{"label": "DB Limit", "value": "limit"}],
                    value=["limit"],
                    labelStyle={"display": "flex", "alignItems": "center", "color": COLORS["dark_text"], "fontSize": "14px", "fontWeight": "600", "gap": "6px"},
                ),
                style={"marginTop": "6px"}
            )
        ],
        className="toolbar-panel",
        style={
            "minWidth": "130px", "width": "130px", "height": "90px", "padding": "9px 16px",
            "display": "flex", "flexDirection": "column", "justifyContent": "center", "gap": "2px",
            "backgroundColor": COLORS["surface_card_glass"], "borderRadius": "8px"
        },
    )

def create_column_group_panel():
    return html.Div(
        [
            dcc.Checklist(
                id="column-groups-checklist",
                options=COLUMN_GROUP_OPTIONS,
                value=DEFAULT_COLUMN_GROUP_VALUES,
                labelStyle={"display": "flex", "alignItems": "center", "color": "#FFFFFF", "fontSize": "14px", "fontWeight": "600", "gap": "6px"},
                style={"display": "flex", "flexDirection": "column", "gap": "6px"},
            )
        ],
        className="toolbar-panel",
        style={
            "minWidth": "130px", "width": "130px", "height": "90px", "padding": "9px 16px",
            "display": "flex", "flexDirection": "column", "justifyContent": "center",
            "backgroundColor": COLORS["surface_card_glass"], "borderRadius": "8px"
        },
    )

def create_button_um_panel():
    return html.Div(
        [
            html.Button("🔍 Buscar", id="btn-search-inspections", className="toolbar-button toolbar-button--secondary"),
            html.Button("➕ Novo", id="btn-open-new-record", className="toolbar-button toolbar-button--new"),
        ],
        className="toolbar-panel",
        style={
            "minWidth": "165px", "width": "165px", "height": "90px", "padding": "16px",
            "display": "flex", "flexDirection": "column", "justifyContent": "space-between",
            "backgroundColor": COLORS["surface_card_glass"], "borderRadius": "8px"
        },
    )

def create_button_dois_panel():
    return html.Div(
        [
            html.Div([
                html.Button("👤 Usuários", id="btn-open-users", className="toolbar-button toolbar-button--secondary"),
                html.Button("📈 Aportes", id="btn-investimentos", className="toolbar-button toolbar-button--secondary"),
                html.Button("📊 Financial", id="btn-finance-control", className="toolbar-button toolbar-button--secondary"),
            ], style={"display": "flex", "gap": "10px"}),
            html.Div([
                html.Button("💸 Guy Pay", id="btn-open-guy-pay", className="toolbar-button toolbar-button--secondary"),
                html.Button("🧩 Em breve", id="btn-coming-soon", className="toolbar-button toolbar-button--tertiary"),
                html.Button("🚪 Logout", id="btn-logout", className="toolbar-button toolbar-button--logout"),
            ], style={"display": "flex", "gap": "10px"}),
        ],
        className="toolbar-panel",
        style={
            "minWidth": "442px", "height": "90px", "padding": "8px 16px",
            "display": "flex", "flexDirection": "column", "justifyContent": "center", "gap": "8px",
            "backgroundColor": COLORS["surface_card_glass"], "borderRadius": "8px"
        },
    )

def create_main_toolbar(session_user=None):
    return html.Div(
        [
            html.Div(
                [
                    html.Div([
                        html.Img(src=load_logo_src(), style={"height": "58px", "width": "auto"}),
                        create_welcome_panel(session_user),
                    ], style={"display": "flex", "alignItems": "center", "gap": "10px"}),
                    
                    create_toolbar_divider(reduced_height=True),
                    
                    html.Div([
                        create_radio_panel(),
                        create_column_group_panel(),
                    ], style={"display": "flex", "gap": "10px"}),
                    
                    create_toolbar_divider(reduced_height=True),
                    
                    html.Div([
                        create_button_um_panel(),
                        create_button_dois_panel(),
                        create_toolbar_divider(reduced_height=True),
                        create_express_totals_panel(),
                    ], style={"display": "flex", "alignItems": "center", "gap": "10px"}),
                ],
                style={"display": "flex", "alignItems": "center", "height": "100%", "gap": "10px"}
            )
        ],
        className="card",
        style={
            "display": "flex", "justifyContent": "space-between", "alignItems": "center",
            "margin": "5px 10px 0 10px", "padding": "0 16px", "height": "120px",
            "backgroundColor": COLORS["dark_card"], "borderRadius": "12px"
        },
    )

# ==============================================================================
# COMPONENTES: GRID PRINCIPAL
# ==============================================================================

def create_grid_area():
    return html.Div(
        [
            dcc.Store(id="grid-row-height", data=MAIN_GRID_ROW_HEIGHT),
            dag.AgGrid(
                id="grid",
                rowData=[],
                columnDefs=[
                    {"field": "id_princ", "headerName": "ID"},
                    {"field": "player", "headerName": "Player"},
                    {"field": "segurado", "headerName": "Segurado"},
                    {"field": "status", "headerName": "Status"},
                ],
                defaultColDef={"filter": True, "sortable": True, "resizable": True},
                className="ag-theme-alpine-dark",
                style={"height": "calc(100vh - 200px)", "width": "100%", "borderRadius": "12px"},
            ),
        ]
    )

# ==============================================================================
# COMPONENTES: MODAIS (Simplificados para Layout)
# ==============================================================================

def create_new_record_modal():
    return html.Div(
        id="new-record-modal-mask",
        className="modal-mask",
        style={"display": "none"},
        children=[
            html.Div(
                className="modal-card modal-card--form",
                children=[
                    html.Div(
                        className="modal-header",
                        children=[
                            html.Div("📝 Inserir Novo Trabalho", className="modal-header__title"),
                            html.Button("✖", id="btn-close-new-record", className="toolbar-button--icon"),
                        ]
                    ),
                    html.Div(
                        className="modal-body",
                        children=[
                            html.Label("Player"), dcc.Dropdown(id="new-id_contr"),
                            html.Label("Segurado"), dcc.Dropdown(id="new-segur_nome"),
                            html.Label("Atividade"), dcc.Dropdown(id="new-atividade"),
                            html.Label("Inspetor"), dcc.Dropdown(id="new-id_user_guy"),
                            html.Label("Data Inspeção"), dcc.DatePickerSingle(id="new-dt_inspecao"),
                            html.Label("Honorário"), dcc.Input(id="new-honorario", type="number"),
                        ]
                    ),
                    html.Div(
                        className="modal-footer",
                        children=[
                            html.Button("Cancelar", id="btn-cancel-new-record"),
                            html.Button("Cadastrar", id="create-record-button"),
                        ]
                    )
                ]
            )
        ]
    )

def create_users_modal():
    return html.Div(id="users-modal-mask", style={"display": "none"}, children=[html.Div("Modal Usuários Placeholder")])

def create_registration_modal():
    return html.Div(id="registration-modal-mask", style={"display": "none"}, children=[html.Div("Modal Registro Placeholder")])

def create_search_inspections_modal():
    return html.Div(id="search-inspections-modal-mask", style={"display": "none"}, children=[html.Div("Modal Busca Placeholder")])

def create_finance_modal():
    return html.Div(id="finance-modal-mask", style={"display": "none"}, children=[html.Div("Modal Financeiro Placeholder")])

def create_guy_pay_modal():
    return html.Div(id="guy-pay-modal-mask", style={"display": "none"}, children=[html.Div("Modal Guy Pay Placeholder")])

def create_action_choice_modal():
    return html.Div(id="action-modal-mask", style={"display": "none"}, children=[html.Div("Modal Ações Placeholder")])

def create_forward_modal():
    return html.Div(id="forward-modal-mask", style={"display": "none"}, children=[html.Div("Modal Encaminhar Placeholder")])

def create_marker_modal():
    return html.Div(id="marker-modal-mask", style={"display": "none"}, children=[html.Div("Modal Marcador Placeholder")])

def create_delete_modal():
    return html.Div(id="delete-modal-mask", style={"display": "none"}, children=[html.Div("Modal Excluir Placeholder")])

def create_invest_modal():
    return html.Div(id="invest-modal-mask", style={"display": "none"}, children=[html.Div("Modal Investimentos Placeholder")])

def create_ocr_upload_modal():
    return html.Div(id="ocr-upload-modal-mask", style={"display": "none"}, children=[html.Div("Modal OCR Placeholder")])

def create_toast_container():
    return html.Div(id="toast-container", style={"position": "fixed", "top": "20px", "right": "20px"})

# ==============================================================================
# LAYOUT PRINCIPAL
# ==============================================================================

def create_main_layout():
    return html.Div(
        [
            create_main_toolbar(),
            html.Div(
                [create_grid_area()],
                style={"padding": "10px", "height": "calc(100vh - 180px)", "overflow": "hidden"}
            ),
            html.Div(id="status-msg", className="status-msg", style={"margin": "10px", "padding": "16px"}),
            
            # Stores
            dcc.Store(id="full-data-store"),
            dcc.Store(id="users-modal-open"),
            dcc.Store(id="action-choice-store"),
            dcc.Store(id="delete-target-store"),
            dcc.Store(id="forward-target-store"),
            dcc.Store(id="marker-target-store"),
            dcc.Store(id="toast-store"),
            
            # Modais
            create_users_modal(),
            create_new_record_modal(),
            create_registration_modal(),
            create_search_inspections_modal(),
            create_finance_modal(),
            create_guy_pay_modal(),
            create_action_choice_modal(),
            create_forward_modal(),
            create_marker_modal(),
            create_delete_modal(),
            create_invest_modal(),
            create_ocr_upload_modal(),
            create_toast_container(),
        ],
        style={"backgroundColor": COLORS["bg_primary"], "minHeight": "100vh", "color": COLORS["dark_text"]}
    )

def create_login_layout():
    return html.Div(
        className="login-page",
        children=[
            html.Div(
                className="login-card",
                children=[
                    html.H1("xFinance"),
                    dcc.Input(id="login-email", placeholder="Email"),
                    dcc.Input(id="login-password", type="password", placeholder="Senha"),
                    html.Button("Entrar", id="login-button"),
                    html.Div(id="login-status-msg")
                ]
            )
        ]
    )

# ==============================================================================
# APP ENTRY POINT
# ==============================================================================

app = dash.Dash(__name__)
app.title = "xFinance NG"

app.layout = html.Div(
    [
        dcc.Location(id="url", refresh=False),
        dcc.Store(id="session-store", storage_type="session"),
        html.Div(id="page-content", children=create_main_layout()), # Default para Main Layout para visualização
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)
```

---

## SEÇÃO 2 — Descrição funcional da tela

O **xFinance** é um "cockpit" financeiro e operacional para gestão de inspeções, repasses e fluxo de caixa. A tela principal é um dashboard operacional denso, focado em produtividade e visualização de dados em grade.

**Seções Principais:**

1.  **Toolbar Superior (Header):**
    *   **Área Esquerda:** Logo da empresa e Painel de Boas-vindas (Saudação, Data/Hora, Clima).
    *   **Área Central (Filtros):**
        *   **Radio Panel:** Filtros rápidos de visualização ("Player" para visão por cliente, "My Job" para tarefas do usuário) e toggle "DB Limit".
        *   **Column Groups:** Checkboxes para alternar visibilidade de grupos de colunas no grid ("Work Flow", "Recebíveis", "Pagamentos").
    *   **Área Direita (Ações e KPIs):**
        *   **Botões Primários:** "Buscar" (abre modal de pesquisa) e "Novo" (abre modal de cadastro).
        *   **Botões Secundários:** Acesso a módulos administrativos ("Usuários", "Aportes", "Financial", "Guy Pay") e Logout.
        *   **Painel Express:** Exibe totais financeiros rápidos (Honorários, Despesas e Pendências) com destaque visual (cores verde/vermelho).

2.  **Grid Principal (Corpo):**
    *   Ocupa a maior parte da tela. É uma tabela interativa (AgGrid) onde ocorrem as operações diárias.
    *   Exibe linhas coloridas condicionalmente (verde para pago, vermelho para pendente).

3.  **Barra de Status (Footer):**
    *   Área inferior para mensagens de feedback do sistema e logs de operações.

4.  **Modais (Overlays):**
    *   O sistema depende fortemente de modais para tarefas específicas (Cadastro, Edição Financeira, Upload OCR, etc.) para não sair do contexto do grid.

---

## SEÇÃO 3 — Lista de componentes visuais

*   **Dropdowns:**
    *   `new-id_contr`, `new-segur_nome`, `new-atividade`, `new-id_user_guy`: Seleção de entidades no cadastro.
    *   `new-id_uf`, `new-id_cidade`: Filtros geográficos em cascata.
    *   `finance-filter-ano-inicial`, `finance-filter-ano-final`: Seleção de período no módulo financeiro.
    *   `search-segurado`, `search-atividade`: Filtros de busca.
*   **Inputs:**
    *   `login-email`, `login-password`: Credenciais de acesso.
    *   `new-honorario`: Campo numérico monetário.
    *   `new-dt_inspecao`: DatePicker para datas.
*   **Botões:**
    *   `btn-search-inspections`, `btn-open-new-record`: Ações operacionais frequentes.
    *   `btn-investimentos`, `btn-finance-control`: Acesso a módulos de gestão.
    *   `btn-logout`: Saída do sistema.
    *   Botões de fechar (`✖`) e confirmar (`✓`) em todos os modais.
*   **Cards:**
    *   `toolbar-panel`: Contêineres translúcidos na toolbar para agrupar controles.
    *   `panel-card`: Card de boas-vindas.
    *   `modal-card`: Estrutura base de todos os modais.
*   **Tabelas:**
    *   `grid`: AgGrid principal (Dark theme).

---

## SEÇÃO 4 — Pontos de melhoria visual

*   **Toolbar Fragmentada:** A toolbar atual possui muitos "blocos" separados (`toolbar-panel`). Eles poderiam ser unificados em uma barra de ferramentas contínua e mais coesa visualmente.
*   **Hierarquia de Botões:** Os botões de "Novo" e "Buscar" competem visualmente com os botões administrativos. Uma distinção mais clara (ex: FAB ou botões de destaque vs. ícones na navbar) ajudaria.
*   **Painel Express:** Os valores financeiros estão "espremidos" em um card pequeno. Eles poderiam ser transformados em "badges" ou indicadores mais limpos na barra superior.
*   **Modais:** Padronizar o cabeçalho e rodapé de todos os modais para garantir consistência (alguns têm ícones, outros não).
*   **Feedback Visual:** A barra de status inferior (`status-msg`) é muito discreta. Mensagens de sucesso/erro poderiam usar "Toasts" flutuantes (já previstos no código, mas pouco integrados visualmente).
