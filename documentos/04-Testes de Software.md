# Planos de Testes de Software

A seguir estão descritos todos os casos de teste de sucesso e insucesso que cobrem o sistema.

### ETAPA 2

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - Cadastrar uma conta</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário consegue cadastrar uma conta no sistema.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Matheus Castelliano</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001	Permitir que o usuário cadastre sua conta <br> RF-002	Permitir que o usuário faça login</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website.<br>
      2. Acessar a página de login, clicar no botão "Cadastre-se".<br>
      3. Ao ser redirecionado para a página de casdastro, preencher o formulário com no mínimo os campos obrigatórios e enviar.<br>
      4. Após enviar, o sistema deve exibir um modal de sucesso, com a mensagem "Cadastro Realizado".<br>
      5. Após alguns segundos o usuário deve ser redirecionado para a página de login.
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      Preencher o formulário com dados do usuário, com no mínimo os campos obrigatórios.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve cadastrar o usuário no banco de dados para que depois ele possa realizar login e utilizar a aplicação.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - Realizar Login com Sucesso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário consegue fazer login no sistema com credenciais válidas.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Lucas Guimarães</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-002: Permitir que o usuário faça login</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Acessar a página de login<br>
      3. Inserir email válido no campo "Email"<br>
      4. Inserir senha correta no campo "Senha"<br>
      5. Clicar no botão "Entrar"<br>
      6. Verificar redirecionamento para o painel principal
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Email:</strong> Email de usuário previamente cadastrado<br>
      - <strong>Senha:</strong> Senha correta do usuário
    </td>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve autenticar o usuário e redirecioná-lo para o painel principal, permitindo acesso às funcionalidades da aplicação.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - I01<br>Login com Credenciais Inválidas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o comportamento do sistema quando o usuário tenta fazer login com credenciais inválidas.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Lucas Guimarães</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-002: Permitir que o usuário faça login</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Acessar a página de login<br>
      3. Inserir email inválido ou senha incorreta<br>
      4. Clicar no botão "Entrar"<br>
      5. Verificar exibição de mensagem de erro
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Email:</strong> Email inexistente ou senha incorreta<br>
      - <strong>Exemplos:</strong> usuario@inexistente.com, senha123incorreta
    </td>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve exibir mensagem de erro apropriada e não permitir acesso à aplicação com credenciais inválidas.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - Realizar recuperação de senha</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se é realizado o processo de recuperação de senha do usuário.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Vinicius Silva</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-003: Permitir que o usuário recupere a senha</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Acessar a página de login<br>
      3. Clicar no botão "esqueceu sua senha?"<br>
      4. Inserir email previamente cadastrado para recuperação de senha<br>
      5. Clicar no botão "Enviar link de recuperação"<br>
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Email:</strong> Email de usuário previamente cadastrado<br>
    </td>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve enviar ao email cadastrado, um link para recuperação de senha para o site.</td>
  </tr>
</table>





### ETAPA 3

<table>
  <tr>
    <th colspan="2" width="1000">CT-006 - S<br>Classificar amostra de feijão</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário consegue obter um relatório de análise de amostra de feijão.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Arthur Costa</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-006: Permitir que o Produtor Rural classifique feijão carioca usando IA</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Realizar o login na plataforma (com qualquer tipo de usuário)<br>
      3. Ao ser redirecionado para o painel principal, clicar no botão "Classificar Amostra"<br>
      4. Fazer upload de um arquivo de imagem no local indicado<br>
      5. Clicar no botão "Classificar"
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Imagem:</strong> Inserir uma imagem aleatória de amostra de feijão<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve gerar e apresentar corretamente ao usuário a análise completa da amostra de feijão enviada.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-006 - I01<br>Envio de imagem inválida</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o comportamento da aplicação quando o usuário envia uma imagem inválida, ou seja, uma imagem que não corresponde a uma amostra de feijão.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Arthur Costa</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-006: Permitir que o Produtor Rural classifique feijão carioca usando IA</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Realizar o login na plataforma (com qualquer tipo de usuário)<br>
      3. Ao ser redirecionado para o painel principal, clicar no botão "Classificar Amostra"<br>
      4. Fazer upload de um arquivo de imagem no local indicado. A imagem pode ser qualquer uma, desde que não corresponda a uma amostra de feijão<br>
      5. Clicar no botão "Classificar"
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Imagem:</strong> Inserir uma imagem aleatória que não corresponda a uma amostra de feijão<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve interromper o processamento e apresentar uma mensagem de erro, informando que a imagem é inválida.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - Permitir que o usuário altere seus dados.</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário consegue alterar seus dados cadastrais.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430"> Castelliano</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-004	Permitir que o usuário edite as informações do seu perfil<br> RF-002	Permitir que o usuário faça login</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website.<br>
      2. Realizar login.<br>
      3. Acessar a página de editar perfil, alterar os dados desejados no formulário e enviar.<br>
      4. Após enviar, o sistema deve exibir um modal de sucesso, com a mensagem "Dados alterados com sucesso".<br>
      5. Após alguns segundos o usuário deve ser redirecionado para a página de editar perfil.
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Alterar os dados desejados no formulário.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve alterar os dados cadastrais do usuário e atualizar no banco de dados com as novas informações.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-010 - Visualização de Conteúdos Educativos (Feed)</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verificar as funcionalidades básicas do feed: acesso, cadastro via Strapi e filtros.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Lucas Guimarães</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-010: Permitir que o Produtor Rural visualize conteúdos educativos</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      <strong>Cadastro de conteúdo via Strapi:</strong><br>
      1. Acessar painel administrativo Strapi<br>
      2. Navegar para "Content Types" → "Posts"<br>
      3. Criar novo post com título, autor e descrição<br>
      4. Publicar o conteúdo<br><br>
      <strong>Acesso ao feed:</strong><br>
      5. Fazer login na plataforma<br>
      6. Navegar para a seção "Feed"<br>
      7. Verificar carregamento dos conteúdos<br>
      8. Verificar exibição de título, autor, data e conteúdo<br><br>
      <strong>Filtrar conteúdos:</strong><br>
      9. Usar a barra de busca no feed<br>
      10. Inserir termo de pesquisa<br>
      11. Verificar resultados filtrados<br>
      12. Limpar filtro e verificar retorno de todos os posts
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Post criado no Strapi com título, descrição e autor<br>
      - Usuário logado na plataforma<br>
      - Termo de busca válido para filtro
    </td>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>
      - Conteúdo criado no Strapi deve aparecer no feed<br>
      - Feed deve exibir título, autor, data e conteúdo das publicações<br>
      - Sistema deve filtrar conteúdos conforme busca<br>
      - Interface deve ser responsiva e acessível
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-015 - Sistema de Comentários e Curtidas em Conteúdos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verificar todas as funcionalidades de interação: comentários, curtidas, contador e modal de usuários.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Lucas Guimarães</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-015: Permitir que o Usuário comente e curta conteúdos educativos</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      <strong>Preparação:</strong><br>
      1. Fazer login na plataforma<br>
      2. Navegar para a seção "Feed"<br>
      3. Verificar que existem posts disponíveis<br><br>
      <strong>Teste de comentários:</strong><br>
      4. Clicar em um post do feed<br>
      5. Verificar abertura da sidebar de comentários<br>
      6. Digitar comentário no campo de texto<br>
      7. Enviar comentário<br>
      8. Verificar que comentário aparece na lista<br>
      9. Fechar sidebar de comentários<br><br>
      <strong>Teste de curtir post:</strong><br>
      10. Identificar um post não curtido (botão coração vazio)<br>
      11. Clicar no botão "Curtir"<br>
      12. Verificar mudança visual do botão (coração preenchido em vermelho)<br>
      13. Verificar incremento do contador de curtidas<br><br>
      <strong>Teste de descurtir post:</strong><br>
      14. Clicar novamente no botão "Curtir" do mesmo post<br>
      15. Verificar volta ao estado original (coração vazio)<br>
      16. Verificar decremento do contador de curtidas<br><br>
      <strong>Teste de modal de curtidas:</strong><br>
      17. Curtir novamente o post<br>
      18. Clicar no contador de curtidas<br>
      19. Verificar abertura do modal com lista de usuários<br>
      20. Verificar que o usuário atual aparece na lista<br>
      21. Fechar modal clicando fora ou no botão fechar
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Usuário logado com permissões para interagir com conteúdos<br>
      - Posts disponíveis no feed para interação<br>
      - Texto válido para comentário
    </td>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>
      - Sidebar de comentários deve abrir/fechar corretamente<br>
      - Comentários devem ser salvos e exibidos na lista<br>
      - Botão de curtir deve responder corretamente ao clique<br>
      - Feedback visual deve ser imediato (coração preenchido/vazio)<br>
      - Contador de curtidas deve atualizar em tempo real<br>
      - Estado das interações deve persistir ao recarregar a página<br>
      - Modal deve mostrar lista correta de usuários que curtiram<br>
      - Usuário não logado deve ter restrições adequadas
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-014 - S<br>Interação com assistente de IA</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se a interação entre o usuário e o assistente de IA acontece corretamente.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Arthur Costa</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-014: Permitir que o Produtor Rural interaja com um assistente virtual especializado em agricultura</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Realizar o login na plataforma como produtor rural<br>
      3. Ao ser redirecionado para o painel principal, clicar no link "Assistente Virtual"<br>
      4. Enviar uma interação para o assitente virtual<br>
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Prompt:</strong> Inserir uma pergunta ou orientação para o assitente virtual<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O assistente virtual deve apresentar uma resposta coerente com o prompt enviado.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-016<br>Participação do produtor rural em grupos de produtores</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o produtor rural consegue entrar em um grupo de produtores.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Vinicius Silva</td>
  </tr>
 <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr> 
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-008: Permitir que o Produtor Rural participe de grupos</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o website<br>
      2. Realizar o login na plataforma como produtor rural<br>
      3. Ao ser redirecionado para o painel principal, clicar no link "Grupos"<br>
      4. Selecionar o grupo desejado a participar<br>
      </td>
  </tr>
    <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - Usuário logado como produtor rural<br> 
      - Botão participar nas opções dos grupos para que o produtor escolha o grupo desejado<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O produtor rural deve conseguir se inserir em um grupo de sua escolha.</td>
  </tr>
</table>

### ETAPA 4

TESTES A IMPLEMENTAR

# Evidências de Testes de Software

A seguir estão apresentadas as evidências que comprovam o sucesso ou insucesso para cada caso de teste descrito na seção acima.

## Parte 1 - Testes de desenvolvimento

Testes realizados pelo próprio desenvolvedor responsável pela implementação do requisito.

### ETAPA 2

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 <br>Cadastrar uma conta</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve cadastrar o usuário no banco de dados para que depois ele possa realizar login e utilizar a aplicação</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Matheus Castelliano</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>
        <video src="https://github.com/user-attachments/assets/6cedb43a-58da-4d28-8d6b-3daa821315dd"/>
      </span>
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 <br>Realizar Login com Sucesso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">	O sistema deve autenticar o usuário e redirecioná-lo para o painel principal, permitindo acesso às funcionalidades da aplicação.
</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Lucas Guimarães</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 -I01 <br>Login com Credenciais Inválidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve exibir mensagem de erro apropriada e não permitir acesso à aplicação com credenciais inválidas.</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Lucas Guimarães</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>


### ETAPA 3

<table>
  <tr>
    <th colspan="6" width="1000">CT-006 - S<br>Classificar amostra de feijão</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve gerar e apresentar corretamente ao usuário a análise completa da amostra de feijão enviada.</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Arthur Costa</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">08/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está gerando e apresentando a análise corretamente.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <video src="https://github.com/user-attachments/assets/757c4088-84f6-4c4f-9278-f0622036e0f1" />
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-006 - I01<br>Envio de imagem inválida</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve interromper o processamento e apresentar uma mensagem de erro, informando que a imagem é inválida.</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Arthur Costa</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">08/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema interrompe o processamento com sucesso e informa o erro.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <video src="https://github.com/user-attachments/assets/96bf67af-432e-44db-bc72-ab1c0f756345" />
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-010 - S<br>Teste completo da funcionalidade de feed (RF-010)</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">
      - Conteúdo criado no Strapi deve aparecer no feed<br>
      - Feed deve exibir título, autor, data e conteúdo das publicações<br>
      - Sistema deve filtrar conteúdos conforme busca
    </td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Lucas Guimarães</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">08/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está apresentando todas as informações corretamente.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      N/A
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-007 <br>Permitir que o usuário altere seus dados.</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve alterar os dados cadastrais do usuário e atualizar no banco de dados com as novas informações.</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade (desenvolvimento e teste)</strong></td>
    <td width="430">Matheus Castelliano</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>
        <video src="https://github.com/user-attachments/assets/b2b7f544-0f19-41b1-9050-6133775546e6" />  
      </span> 
    </td>
  </tr>
</table>


## Parte 2 - Testes por pares

Testes realizados por um desenvolvedor terceiro, diferente daquele responsável pela implementação do requisito.

### ETAPA 2

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 <br>Cadastrar uma conta</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve cadastrar o usuário no banco de dados para que depois ele possa realizar login e utilizar a aplicação</td>
  </tr>
    <tr>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Lucas Guimarães</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 <br>Realizar Login com Sucesso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">	O sistema deve autenticar o usuário e redirecioná-lo para o painel principal, permitindo acesso às funcionalidades da aplicação.</td>
  </tr>
    <tr>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Matheus Castelliano</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>
        <video src="https://github.com/user-attachments/assets/e5a38da9-3533-47d2-97ea-c3cff39c4400" />
      </span> 
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 -I01<br>Login com Credenciais Inválidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve exibir mensagem de erro apropriada e não permitir acesso à aplicação com credenciais inválidas.</td>
  </tr>
    <tr>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Matheus Castelliano</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado, porém a mensagem de erro pode ser mais clara para o usuário.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>
        <video src="https://github.com/user-attachments/assets/c9f46b52-9ee5-4979-b635-5edc98c3c227"/>
      </span> 
    </td>
  </tr>
</table>

### ETAPA 3

<table>
  <tr>
    <th colspan="6" width="1000">CT-014 - S<br>Interação com assistente de IA</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O usuário deve ser capaz de completar uma interação com o assistente de IA.</td>
  </tr>
    <tr>
      <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Vinícius Silva</td>
      <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Arthur Costa</td>
     <td width="100"><strong>Data do teste</strong></td>
    <td width="150">15/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema realiza corretamente a interação com a IA. Entretanto, o layout da tela ainda precisa de ajustes para se adequar ao design proposto.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><video src="https://github.com/user-attachments/assets/dfdd095f-5b8d-43c2-a771-d5c201282b37"/></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-016<br>Participação do produtor rural em grupos de produtores</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O produtor rural deve conseguir se inserir em um grupo de sua escolha.</td>
  </tr>
    <tr>
      <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Juan Pereira Alves Andrade</td>
      <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Vinicius Silva</td>
     <td width="100"><strong>Data do teste</strong></td>
    <td width="150">19/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema permite que o produtor rural crie seu grupo e realize a edição, a exclusão e o compartilhamento de grupos existentes, entretanto não há a opção de se inserir aos grupos.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td  colspan="6" align="center"> <img src="https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2025-2-e5-proj-empext-t1-pmv-ads-2025-2-e5-cultivodobem/blob/main/documentos/img/gruposProdutores.png"/></td>   
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-007 <br>Permitir que o usuário altere seus dados.</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve alterar os dados cadastrais do usuário e atualizar no banco de dados com as novas informações.</td>
  </tr>
    <tr>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Lucas Guimarães</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-010 - Visualização de Conteúdos Educativos (Feed)
</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Sistema exibe o conteúdo do feed como esperado</td>
  </tr>
    <tr>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Matheus Castelliano</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-015 - Sistema de Comentários e Curtidas em Conteúdos
</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Sistema tem o comportamento de comentários e curtidas como esperado</td>
  </tr>
    <tr>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Matheus Castelliano</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">14/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está realizando o comportamento esperado.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>

### ETAPA 4

TESTES A IMPLEMENTAR
