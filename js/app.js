// ========= CONSTANTES =========
const API_KEY = '724ceb21a4014b48b6c82ff46f1625e6';

    document.addEventListener('DOMContentLoaded', () => {
        const formjogos = document.getElementById("formjogos");
        const buscajogo = document.getElementById("buscajogo");
        const enviar = document.getElementById("enviar");
        const resultados = document.getElementById("resultados");
        const formCategorias = document.getElementById('formJogosCategoria');
        const resultadosCategorias = document.getElementById('resultadosCategorias');
        jogosAleatorios();
        geraAnosLancamento();
        carregarGenerosEPlataformas();

        if (!formjogos || !buscajogo || !resultados) {
            console.error('Elementos necessários não encontrados');
            return;
        }

        formjogos.addEventListener('submit', async (event) => {
            event.preventDefault();
            const jogoNome = buscajogo.value.trim().toLowerCase();
            
            if (!jogoNome) {
                showError('Por favor, digite o nome de um jogo');
                return;
            }

            await buscarJogo(jogoNome);
        });

        // Listener para busca por categoria (filtros)
        if (formCategorias) {
            formCategorias.addEventListener('submit', async (e) => {
                e.preventDefault();
                const categoria = document.getElementById('categoria')?.value || '';
                const ano = document.getElementById('ano')?.value || '';
                const plataforma = document.getElementById('plataforma')?.value || '';
                // Inicia na página 1
                await buscarPorCategoria({ categoria, ano, plataforma, page: 1 });
            });
        }
    });

// Carrega gêneros e plataformas da API RAWG e popula os selects
async function carregarGenerosEPlataformas() {
    const categoriaSelect = document.getElementById('categoria');
    const plataformaSelect = document.getElementById('plataforma');
    if (!categoriaSelect && !plataformaSelect) return;

    try {
        // busca gêneros
        const genresResp = await fetch(`https://api.rawg.io/api/genres?key=${API_KEY}`);
        if (genresResp.ok) {
            const genresData = await genresResp.json();
            if (categoriaSelect) {
                categoriaSelect.innerHTML = '';
                // adiciona uma opção vazia
                const optAll = document.createElement('option');
                optAll.value = '';
                optAll.textContent = '-- Selecionar categoria --';
                categoriaSelect.appendChild(optAll);
                (genresData.results || []).forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.slug || g.id || g.name.toLowerCase();
                    opt.textContent = g.name;
                    categoriaSelect.appendChild(opt);
                });
            }
        }

        // busca plataformas
        const platformsResp = await fetch(`https://api.rawg.io/api/platforms?key=${API_KEY}`);
        if (platformsResp.ok) {
            const platformsData = await platformsResp.json();
            if (plataformaSelect) {
                plataformaSelect.innerHTML = '';
                const optAll = document.createElement('option');
                optAll.value = '';
                optAll.textContent = '-- Selecionar plataforma --';
                plataformaSelect.appendChild(optAll);
                (platformsData.results || []).forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.slug || p.id || p.name.toLowerCase();
                    opt.textContent = p.name;
                    plataformaSelect.appendChild(opt);
                });
            }
        }
    } catch (err) {
        console.error('Erro ao carregar gêneros/plataformas:', err);
        // se falhar, mantemos os valores estáticos já presentes no HTML
    }
}

    async function buscarJogo(jogoNome) {
        const container = document.getElementById('resultados');
    
        try {
            console.log("chegou aqui");

            container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>';

            jogoNome = jogoNome.trim().toLowerCase().replace(/ /g, '-');
            console.log(jogoNome);
            // Faz a requisição para a API de jogos "https://api.rawg.io/api/games?key=724ceb21a4014b48b6c82ff46f1625e6&search=grand-theft-auto-v"
            const response = await fetch(`https://api.rawg.io/api/games?key=724ceb21a4014b48b6c82ff46f1625e6&search=${jogoNome}`);
            console.log(response);
            if (!response.ok) {
                throw new Error('Jogo não encontrado');
            }
            
            // Converte a resposta para JSON
            const data = await response.json();
            console.log(data);
            console.log("quase lá");
            mostrarJogo(data);
        } catch (error) {
            showError('Jogo não encontrado! Tente novamente.');
        }
    }

    function mostrarJogo(data) {
    const container = document.getElementById('resultados');
    
    if (!data.results || data.results.length === 0) {
        showError('Jogo não encontrado! Tente novamente.');
        return;
    }

    const jogo = data.results[0]; 
    const jogoNome = jogo.name.charAt(0).toUpperCase() + jogo.name.slice(1);
    console.log(data);
    console.log(jogoNome);
    
    container.innerHTML = `
        <div class="col-md-4 col-sm-6 col-12">
            <div class="card">
                <!-- A imagem tem um fallback caso não carregue -->
                <img src="${jogo.background_image}" class="card-img-top" alt="${jogoNome}" 
                    onerror="this.src='https://via.placeholder.com/150?text=Sem+Imagem'">
                <div class="card-body">
                    <h5 class="card-title">${jogoNome}</h5>
                    <!-- data de lançamento -->
                    <p class="card-text">Lançamento: ${formatDate(jogo.released)}</p>
                    <!-- Mapeia as plataformas de lançamento -->
                    <p class="card-text">Plataforma(s): ${jogo.platforms.map(platform => 
                        platform.platform.name
                    ).join(', ')}</p>
                </div>
            </div>
        </div> 
    `;
}

function showError(message) {
    const container = document.getElementById('resultados');
    container.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
}

// Formata datas ISO (YYYY-MM-DD) para DD/MM/YYYY
function formatDate(dateStr) {
    if (!dateStr) return 'Data desconhecida';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function jogosAleatorios() {
    // Seleciona 3 jogos aleatórios gere codigos aleatorios para poder fazer a busca e  para exibir na página inicial 
    const jogosIds = [];
    while (jogosIds.length < 3) {
        const randomId = Math.floor(Math.random() * 5000) + 1; 
        if (!jogosIds.includes(randomId)) {
            jogosIds.push(randomId);
        }
    }
    const promises = jogosIds.map(id => buscarJogoPorId(id));
    const jogos = await Promise.all(promises);
    mostrarJogosDestaque(jogos);
}

async function geraAnosLancamento() {
    const anosSet = new Set();
    const currentYear = new Date().getFullYear();
    for (let year = 1980; year <= currentYear; year++) {
        anosSet.add(year);
    }

    const selectAno = document.getElementById('ano');
    if (!selectAno) return;
    selectAno.innerHTML = '';
    // opção padrão vazia, para seguir o padrão dos outros selects
    const optAll = document.createElement('option');
    optAll.value = '';
    optAll.textContent = '-- Selecionar ano --';
    selectAno.appendChild(optAll);

    anosSet.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    });
}

async function buscarJogoPorId(id) {
    try {
        const response = await fetch(`https://api.rawg.io/api/games/${id}?key=724ceb21a4014b48b6c82ff46f1625e6`);   
        if (!response.ok) {
            throw new Error('Jogo não encontrado');
        }
        const jogo = await response.json();
        return jogo;
    } catch (error) {
        console.error(`Erro ao buscar jogo com ID ${id}:`, error);
        return null;
    }
}

// ========= BUSCA POR CATEGORIA COM PAGINAÇÃO =========

async function buscarPorCategoria({ categoria, ano, plataforma, page = 1 }) {
    const container = document.getElementById('resultadosCategorias');
    if (!container) {
        console.error('Container resultadosCategorias não encontrado');
        return;
    }

    // Se nenhum filtro for passado, pede ao usuário para selecionar ao menos um
    if (!categoria && !ano && !plataforma) {
        container.innerHTML = `<div class="alert alert-warning">Selecione pelo menos um filtro (categoria, ano ou plataforma).</div>`;
        return;
    }

    const pageSize = 10; // 10 resultados por página
    container.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>';

    try {
        // Constrói parâmetros com somente os filtros presentes
        const paramsObj = { key: API_KEY, page: String(page), page_size: String(pageSize) };
        if (categoria) paramsObj.genres = categoria;
        if (plataforma) paramsObj.platforms = plataforma;
        if (ano) paramsObj.dates = `${ano}-01-01,${ano}-12-31`;

        const params = new URLSearchParams(paramsObj);
        const url = `https://api.rawg.io/api/games?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Erro na busca por categoria');
        const data = await resp.json();

        // Se não retornou resultados e existe categoria, tenta fallback por 'search' usando o rótulo da categoria
        let results = data.results || [];
        if ((!results || results.length === 0) && categoria) {
            const categoriaLabel = document.getElementById('categoria')?.selectedOptions?.[0]?.textContent || categoria;
            const fallbackParamsObj = { key: API_KEY, search: categoriaLabel, page: String(page), page_size: String(pageSize) };
            if (ano) fallbackParamsObj.dates = `${ano}-01-01,${ano}-12-31`;
            if (plataforma) fallbackParamsObj.platforms = plataforma;
            const fallbackUrl = `https://api.rawg.io/api/games?${new URLSearchParams(fallbackParamsObj).toString()}`;
            const fallbackResp = await fetch(fallbackUrl);
            if (fallbackResp.ok) {
                const fallbackData = await fallbackResp.json();
                results = fallbackData.results || [];
                const totalCountFb = fallbackData.count || 0;
                const totalPagesApiFb = Math.ceil(totalCountFb / pageSize) || 1;
                const totalPagesFb = Math.min(totalPagesApiFb, 5);
                renderResultadosCategoria(container, results, page, totalPagesFb);
                return;
            }
        }

        const totalCount = data.count || 0;
        const totalPagesApi = Math.ceil(totalCount / pageSize) || 1;
        const totalPages = Math.min(totalPagesApi, 5);

        renderResultadosCategoria(container, results, page, totalPages);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="alert alert-danger">Erro ao buscar por categoria. Tente novamente.</div>`;
    }
}

function renderResultadosCategoria(container, results, currentPage, totalPages) {
    // Monta a grid com 2 itens por linha (col-md-6)
    const rowId = 'categorias-row';
    let html = `<div class="row g-4" id="${rowId}">`;
    if (!results || results.length === 0) {
        html += `<div class="col-12"><div class="alert alert-info">Nenhum jogo encontrado para os filtros selecionados.</div></div>`;
    } else {
        results.forEach(jogo => {
            const jogoNome = jogo.name ? (jogo.name.charAt(0).toUpperCase() + jogo.name.slice(1)) : 'Sem nome';
            const image = jogo.background_image || 'https://via.placeholder.com/300x200?text=Sem+Imagem';
            const plataformas = (jogo.platforms || []).map(p => p.platform?.name).filter(Boolean).join(', ');
            html += `
                <div class="col-md-6 col-12">
                    <div class="card">
                        <img src="${image}" class="card-img-top" alt="${jogoNome}" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">
                        <div class="card-body">
                            <h5 class="card-title">${jogoNome}</h5>
                            <p class="card-text">Lançamento: ${formatDate(jogo.released)}</p>
                            <p class="card-text">Plataforma(s): ${plataformas || '—'}</p>
                        </div>
                    </div>
                </div>`;
        });
    }
    html += `</div>`;

    // Paginação
    html += `<nav aria-label="Páginas" class="mt-3"><ul class="pagination justify-content-center" id="categorias-pagination">`;
    const prevDisabled = currentPage <= 1 ? ' disabled' : '';
    html += `<li class="page-item${prevDisabled}"><a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a></li>`;

    // mostra de 1 até totalPages (totalPages já limitada a 5)
    for (let p = 1; p <= totalPages; p++) {
        const active = p === currentPage ? ' active' : '';
        html += `<li class="page-item${active}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`;
    }

    const nextDisabled = currentPage >= totalPages ? ' disabled' : '';
    html += `<li class="page-item${nextDisabled}"><a class="page-link" href="#" data-page="${currentPage + 1}">Próxima</a></li>`;
    html += `</ul></nav>`;

    container.innerHTML = html;

    // Adiciona listeners aos links de paginação
    const paginationLinks = container.querySelectorAll('#categorias-pagination a.page-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = Number(link.getAttribute('data-page'));
            if (!page || page < 1) return;
            // Read current filters from form
            const categoria = document.getElementById('categoria')?.value || '';
            const ano = document.getElementById('ano')?.value || '';
            const plataforma = document.getElementById('plataforma')?.value || '';
            await buscarPorCategoria({ categoria, ano, plataforma, page });
        });
    });
}


 function mostrarJogosDestaque(jogos) {
    // O id usado no HTML é 'jogos-destaque'
    const container = document.getElementById('jogos-destaque');
    if (!container) {
        console.error("Container de destaques 'jogos-destaque' não encontrado no DOM.");
        return;
    }

    container.innerHTML = '';

    jogos.forEach(jogo => {
        if (jogo) {
            const jogoNome = jogo.name.charAt(0).toUpperCase() + jogo.name.slice(1);
            const jogoCard = `
                <div class="col-md-4 col-sm-6 col-12">
                    <div class="card">
                        <img src="${jogo.background_image}" class="card-img-top" alt="${jogoNome}" 
                            onerror="this.src='https://via.placeholder.com/150?text=Sem+Imagem'">
                        <div class="card-body">
                            <h5 class="card-title">${jogoNome}</h5>
                            <p class="card-text">Lançamento: ${formatDate(jogo.released)}</p>
                            <p class="card-text">Plataforma(s): ${jogo.platforms.map(platform => platform.platform.name).join(', ')}</p>
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#jogoModal">
                                Já tenho!
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#jogoModal">
                                Quero!
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += jogoCard;
        }
    });
}
