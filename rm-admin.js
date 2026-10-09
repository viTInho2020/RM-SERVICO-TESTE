
// RM ENGENHARIA - Painel administrativo e portfólio Supabase
(function () {
  'use strict';

  const SUPABASE_URL = 'https://cyqyditgqbauqknfnkvh.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F3lTrBC5pqonAzI4V6zxQQ_VhJNf_LF';
  const BUCKET = 'servicos-rm';
  const DETAILS_PAGE = 'detalhes-obras.html';

  if (!window.supabase) {
    console.error('Biblioteca do Supabase não foi carregada.');
    return;
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  let admin = false;
  let editingId = null;

  const css = `
    .rm-admin-entry {
      display: flex;
      justify-content: center;
      padding: 16px;
      background: #f4f7f9;
    }

    .rm-admin-button,
    .rm-admin-primary,
    .rm-admin-secondary,
    .rm-admin-danger {
      border: 0;
      border-radius: 4px;
      padding: 11px 16px;
      font-weight: 700;
      cursor: pointer;
      font: inherit;
    }

    .rm-admin-button,
    .rm-admin-primary,
    .card-link {
      background: #ff7600;
      color: #fff;
    }

    .rm-admin-secondary {
      background: #17263a;
      color: #fff;
    }

    .rm-admin-danger {
      background: #a52a2a;
      color: #fff;
    }

    .rm-admin-panel {
      display: none;
      background: #fff;
      border: 1px solid #dce3e8;
      border-radius: 8px;
      padding: 22px;
      margin: 18px auto 30px;
      width: min(100% - 32px, 1000px);
      box-shadow: 0 8px 24px #17263a14;
      color: #17263a;
    }

    .rm-admin-panel.rm-open {
      display: block;
    }

    .rm-admin-panel h2 {
      margin: 0 0 8px;
    }

    .rm-admin-panel p {
      line-height: 1.5;
    }

    .rm-admin-form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 18px;
    }

    .rm-admin-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rm-admin-field.rm-wide {
      grid-column: 1 / -1;
    }

    .rm-admin-field label {
      font-size: 13px;
      font-weight: 700;
    }

    .rm-admin-field input,
    .rm-admin-field textarea,
    .rm-admin-field select {
      width: 100%;
      box-sizing: border-box;
      padding: 11px;
      border: 1px solid #cbd5dd;
      border-radius: 4px;
      font: inherit;
      background: #fff;
      color: #17263a;
    }

    .rm-admin-field textarea {
      min-height: 100px;
      resize: vertical;
    }

    .rm-admin-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .rm-admin-status {
      margin-top: 12px;
      font-size: 14px;
    }

    .rm-admin-list {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .rm-admin-item {
      border: 1px solid #dce3e8;
      padding: 12px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .rm-admin-item small {
      display: block;
      color: #526273;
      margin-top: 4px;
    }

    .rm-admin-login {
      max-width: 460px;
    }

    .rm-admin-hidden {
      display: none !important;
    }

    .card-link {
      display: inline-block;
      margin-top: 12px;
      padding: 10px 16px;
      border-radius: 4px;
      text-decoration: none !important;
      font-weight: 700;
      cursor: pointer;
    }

    .card-link:hover {
      background: #17263a;
      color: #fff !important;
    }

    @media (max-width: 640px) {
      .rm-admin-form {
        grid-template-columns: 1fr;
      }

      .rm-admin-field.rm-wide {
        grid-column: auto;
      }

      .rm-admin-item {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const host = document.createElement('section');

  host.innerHTML = `
    <div class="rm-admin-entry">
      <button type="button" class="rm-admin-button" id="rmAdminToggle">
        Área administrativa
      </button>
    </div>

    <section class="rm-admin-panel" id="rmAdminPanel" aria-live="polite">
      <div id="rmAdminLogin" class="rm-admin-login">
        <h2>Acesso administrativo</h2>
        <p>Entre com o e-mail e a senha autorizados da RM ENGENHARIA.</p>

        <form id="rmAdminLoginForm" class="rm-admin-form">
          <div class="rm-admin-field rm-wide">
            <label for="rmAdminEmail">E-mail</label>
            <input id="rmAdminEmail" type="email"
              autocomplete="username" required>
          </div>

          <div class="rm-admin-field rm-wide">
            <label for="rmAdminPassword">Senha</label>
            <input id="rmAdminPassword" type="password"
              autocomplete="current-password" required>
          </div>

          <div class="rm-admin-actions rm-wide">
            <button class="rm-admin-primary" type="submit">Entrar</button>
          </div>
        </form>

        <div class="rm-admin-status" id="rmAdminLoginStatus"></div>
      </div>

      <div id="rmAdminDashboard" class="rm-admin-hidden">
        <h2>Gerenciar serviços</h2>
        <p>Cadastre obras e publique-as no portfólio da RM ENGENHARIA.</p>

        <form id="rmServiceForm" class="rm-admin-form">
          <div class="rm-admin-field">
            <label for="rmServiceName">Nome do serviço *</label>
            <input id="rmServiceName" required maxlength="180">
          </div>

          <div class="rm-admin-field">
            <label for="rmServiceCategory">Categoria *</label>
            <input id="rmServiceCategory" required maxlength="100"
              placeholder="Ex.: Estruturas metálicas">
          </div>

          <div class="rm-admin-field">
            <label for="rmServiceLocation">Local da obra</label>
            <input id="rmServiceLocation" maxlength="180">
          </div>

          <div class="rm-admin-field">
            <label for="rmServicePublished">Publicação</label>
            <select id="rmServicePublished">
              <option value="false">Salvar como rascunho</option>
              <option value="true">Publicar no site</option>
            </select>
          </div>

          <div class="rm-admin-field rm-wide">
            <label for="rmServiceDescription">Descrição *</label>
            <textarea id="rmServiceDescription" required maxlength="10000"></textarea>
          </div>

          <div class="rm-admin-field">
            <label for="rmServicePhotos">Fotos (JPG, PNG, WebP, AVIF)</label>
            <input id="rmServicePhotos" type="file"
              accept="image/jpeg,image/png,image/webp,image/avif" multiple>
          </div>

          <div class="rm-admin-field">
            <label for="rmServiceVideos">Vídeos (MP4, WebM)</label>
            <input id="rmServiceVideos" type="file"
              accept="video/mp4,video/webm" multiple>
          </div>

          <div class="rm-admin-actions rm-wide">
            <button class="rm-admin-primary" id="rmServiceSave" type="submit">
              Salvar serviço
            </button>
            <button class="rm-admin-secondary" id="rmServiceCancel" type="button">
              Cancelar edição
            </button>
            <button class="rm-admin-danger" id="rmAdminLogout" type="button">
              Sair
            </button>
          </div>
        </form>

        <div class="rm-admin-status" id="rmServiceStatus"></div>
        <h3>Serviços cadastrados</h3>
        <div class="rm-admin-list" id="rmAdminList"></div>
      </div>
    </section>
  `;

  const main = document.querySelector('main');

  if (!main) {
    console.error('Não foi encontrado o elemento <main> para exibir o painel.');
    return;
  }

  main.appendChild(host);

  const $ = id => document.getElementById(id);

  function status(id, message, error = false) {
    const element = $(id);
    if (!element) return;

    element.textContent = message;
    element.style.color = error ? '#a52a2a' : '#176b3a';
  }

  function parseMediaList(value) {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {
        return [value];
      }
    }

    return [];
  }

  function getMediaPath(value) {
    if (typeof value === 'string') return value;

    if (value && typeof value === 'object') {
      return value.path || value.caminho || value.url || value.src || '';
    }

    return '';
  }

  function cleanName(name) {
    return name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-');
  }

  // Cria uma URL de mídia; preserva URLs que já estão completas.
  async function signedFile(fileOrPath) {
    const value = getMediaPath(fileOrPath);

    if (!value) return '';

    if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) {
      return value;
    }

    const path = value
      .replace(/^\/+/, '')
      .replace(/^servicos-rm\//, '');

    const { data, error } = await client.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error) {
      console.error('Erro ao gerar URL da mídia:', error.message);
      return '';
    }

    return data?.signedUrl || '';
  }

  $('rmAdminToggle').addEventListener('click', async () => {
    $('rmAdminPanel').classList.toggle('rm-open');

    if ($('rmAdminPanel').classList.contains('rm-open')) {
      await checkSession();
    }
  });

  async function checkSession() {
    try {
      const { data: sessionData, error: sessionError } =
        await client.auth.getSession();

      if (sessionError || !sessionData?.session) {
        admin = false;
        showLogin();
        return;
      }

      const { data: userData, error: userError } =
        await client.auth.getUser();

      if (userError || !userData?.user) {
        admin = false;
        showLogin();
        return;
      }

      const { data: adminRow, error } = await client
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error || !adminRow) {
        await client.auth.signOut();
        admin = false;
        showLogin();

        status(
          'rmAdminLoginStatus',
          'Esta conta não está autorizada como administradora.',
          true
        );

        return;
      }

      admin = true;
      $('rmAdminLogin').classList.add('rm-admin-hidden');
      $('rmAdminDashboard').classList.remove('rm-admin-hidden');

      await loadAdminList();
    } catch (error) {
      console.error(error);
      status('rmAdminLoginStatus', 'Erro ao verificar o acesso.', true);
    }
  }

  function showLogin() {
    $('rmAdminLogin').classList.remove('rm-admin-hidden');
    $('rmAdminDashboard').classList.add('rm-admin-hidden');
  }

  $('rmAdminLoginForm').addEventListener('submit', async event => {
    event.preventDefault();
    status('rmAdminLoginStatus', 'Verificando acesso...');

    try {
      const { error } = await client.auth.signInWithPassword({
        email: $('rmAdminEmail').value.trim(),
        password: $('rmAdminPassword').value
      });

      if (error) {
        status(
          'rmAdminLoginStatus',
          'Não foi possível entrar. Confira o e-mail e a senha.',
          true
        );
        return;
      }

      await checkSession();
    } catch (error) {
      console.error(error);
      status('rmAdminLoginStatus', 'Erro ao tentar entrar.', true);
    }
  });

  // PORTFÓLIO PÚBLICO: cada obra abre detalhes-obras.html?id=ID.
  async function loadPublicServices() {
    const grid = document.querySelector('.servicos-grid');
    if (!grid) return;

    grid.querySelectorAll('[data-rm-dynamic="true"]')
      .forEach(element => element.remove());

    const { data, error } = await client
      .from('servicos')
      .select('id,nome,descricao,categoria,local,fotos,videos')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar serviços publicados:', error.message);
      return;
    }

    for (const item of (data || [])) {
      const photos = parseMediaList(item.fotos);
      const imageUrl = photos.length ? await signedFile(photos[0]) : '';

      const article = document.createElement('article');
      article.className = 'card-servico';
      article.dataset.rmDynamic = 'true';

      const image = document.createElement('div');
      image.className = 'card-imagem';

      if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = item.nome || 'Foto da obra';
        img.loading = 'lazy';
        image.appendChild(img);
      } else {
        image.style.background = 'linear-gradient(135deg,#17263a,#30485e)';
      }

      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';

      const content = document.createElement('div');
      content.className = 'card-conteudo';

      const title = document.createElement('h2');
      title.textContent = item.nome || 'Obra';

      const description = document.createElement('p');
      description.textContent = item.descricao || '';

      const category = document.createElement('p');
      category.textContent = [item.categoria, item.local]
        .filter(Boolean)
        .join(' · ');
      category.style.marginTop = '8px';

      const link = document.createElement('a');
      link.className = 'card-link';
      link.textContent = 'Ver detalhes da obra';

      // CORREÇÃO: o nome corresponde ao arquivo criado pelo usuário.
      link.href = DETAILS_PAGE + '?id=' + encodeURIComponent(item.id);

      link.setAttribute(
        'aria-label',
        'Ver detalhes da obra: ' + (item.nome || 'Obra')
      );

      content.append(title, description, category, link);
      article.append(image, overlay, content);
      grid.appendChild(article);
    }
  }

  async function loadAdminList() {
    const list = $('rmAdminList');
    list.textContent = 'Carregando...';

    const { data, error } = await client
      .from('servicos')
      .select('id,nome,categoria,publicado,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      list.textContent = 'Não foi possível carregar a lista.';
      console.error(error);
      return;
    }

    list.replaceChildren();

    if (!data || !data.length) {
      list.textContent = 'Ainda não há serviços cadastrados.';
      return;
    }

    for (const item of data) {
      const row = document.createElement('div');
      row.className = 'rm-admin-item';

      const text = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = item.nome || 'Serviço sem nome';

      const small = document.createElement('small');
      small.textContent =
        (item.categoria || 'Sem categoria') + ' · ' +
        (item.publicado ? 'Publicado' : 'Rascunho');

      text.append(strong, small);

      const actions = document.createElement('div');
      actions.className = 'rm-admin-actions';

      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'rm-admin-secondary';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => editService(item.id));

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'rm-admin-danger';
      del.textContent = 'Excluir';
      del.addEventListener('click', () => deleteService(item.id, item.nome));

      actions.append(edit, del);
      row.append(text, actions);
      list.appendChild(row);
    }
  }

  async function editService(id) {
    const { data, error } = await client
      .from('servicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      status('rmServiceStatus', 'Não foi possível abrir o serviço.', true);
      return;
    }

    editingId = id;

    $('rmServiceName').value = data.nome || '';
    $('rmServiceCategory').value = data.categoria || '';
    $('rmServiceLocation').value = data.local || '';
    $('rmServiceDescription').value = data.descricao || '';
    $('rmServicePublished').value = String(Boolean(data.publicado));
    $('rmServicePhotos').value = '';
    $('rmServiceVideos').value = '';
    $('rmServiceSave').textContent = 'Salvar alterações';

    status(
      'rmServiceStatus',
      'Editando: arquivos já enviados serão mantidos. Selecione novos arquivos para acrescentar.'
    );

    window.scrollTo({
      top: $('rmServiceForm').getBoundingClientRect().top +
        window.scrollY - 100,
      behavior: 'smooth'
    });
  }

  async function uploadFiles(inputId, folder) {
    const files = Array.from($(inputId).files || []);
    const paths = [];

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('O arquivo ' + file.name + ' excede 50 MB.');
      }

      const path = folder + '/' + Date.now() + '-' +
        Math.random().toString(36).slice(2, 9) + '-' +
        cleanName(file.name);

      const { error } = await client.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw new Error(
          'Falha ao enviar ' + file.name +
          '. Verifique se o bucket existe e se as permissões de upload estão configuradas.'
        );
      }

      paths.push(path);
    }

    return paths;
  }

  $('rmServiceForm').addEventListener('submit', async event => {
    event.preventDefault();

    if (!admin) {
      status('rmServiceStatus', 'Entre com uma conta administradora.', true);
      return;
    }

    const save = $('rmServiceSave');
    save.disabled = true;

    status('rmServiceStatus', 'Salvando serviço e enviando arquivos...');

    try {
      const newPhotos = await uploadFiles('rmServicePhotos', 'fotos');
      const newVideos = await uploadFiles('rmServiceVideos', 'videos');

      const payload = {
        nome: $('rmServiceName').value.trim(),
        categoria: $('rmServiceCategory').value.trim(),
        local: $('rmServiceLocation').value.trim(),
        descricao: $('rmServiceDescription').value.trim(),
        publicado: $('rmServicePublished').value === 'true',
        updated_at: new Date().toISOString()
      };

      let result;

      if (editingId) {
        const { data: old, error: oldError } = await client
          .from('servicos')
          .select('fotos,videos')
          .eq('id', editingId)
          .single();

        if (oldError) throw oldError;

        payload.fotos = parseMediaList(old.fotos).concat(newPhotos);
        payload.videos = parseMediaList(old.videos).concat(newVideos);

        result = await client
          .from('servicos')
          .update(payload)
          .eq('id', editingId);
      } else {
        payload.fotos = newPhotos;
        payload.videos = newVideos;

        result = await client
          .from('servicos')
          .insert(payload);
      }

      if (result.error) throw result.error;

      status(
        'rmServiceStatus',
        editingId
          ? 'Serviço atualizado com sucesso.'
          : 'Serviço cadastrado com sucesso.'
      );

      $('rmServiceForm').reset();
      editingId = null;
      save.textContent = 'Salvar serviço';

      await loadAdminList();
      await loadPublicServices();
    } catch (error) {
      console.error(error);
      status(
        'rmServiceStatus',
        error.message || 'Ocorreu um erro ao salvar.',
        true
      );
    } finally {
      save.disabled = false;
    }
  });

  $('rmServiceCancel').addEventListener('click', () => {
    editingId = null;
    $('rmServiceForm').reset();
    $('rmServiceSave').textContent = 'Salvar serviço';
    status('rmServiceStatus', '');
  });

  async function deleteService(id, name) {
    if (!window.confirm(
      'Excluir o serviço "' + (name || '') +
      '"? Esta ação não pode ser desfeita.'
    )) {
      return;
    }

    const { error } = await client
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      status('rmServiceStatus', 'Não foi possível excluir o serviço.', true);
      return;
    }

    status('rmServiceStatus', 'Serviço excluído.');
    await loadAdminList();
    await loadPublicServices();
  }

  $('rmAdminLogout').addEventListener('click', async () => {
    const { error } = await client.auth.signOut();

    if (error) {
      console.error(error);
      status('rmServiceStatus', 'Não foi possível encerrar a sessão.', true);
      return;
    }

    admin = false;
    editingId = null;
    showLogin();
    status('rmAdminLoginStatus', 'Você saiu do painel.');
  });

  loadPublicServices();
})();
