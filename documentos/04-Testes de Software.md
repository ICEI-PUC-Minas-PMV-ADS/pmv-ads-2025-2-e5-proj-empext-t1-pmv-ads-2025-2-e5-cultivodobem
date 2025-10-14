# Planos de Testes de Software

A seguir estão descritos todos os casos de teste de sucesso e insucesso que cobrem o sistema.

### ETAPA 2

// DESCREVER CASOS DE TESTE DE SUCESSO PARA LOGIN E RECUPERAÇÃO DE SENHA

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
      - Preencher o formulário com no mínimo os campos obrigatórios.<br>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve cadastrar o usuário no banco de dados para que depois ele possa realizar login e utilizar a aplicação.</td>
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

### ETAPA 4

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
    <td width="430">Matheus Castelliano</td>
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
    <th colspan="2" width="1000">CT-010 - S<br>Teste completo da funcionalidade de feed (RF-010)</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verificar todas as funcionalidades do feed: acesso, cadastro via Strapi, comentários e filtros.</td>
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
    <td>RF-010: Permitir que o Produtor Rural visualize conteúdos educativos<br>RF-015: Permitir que o Usuário comente conteúdos educativos</td>
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
      7. Verificar carregamento dos conteúdos<br><br>
      <strong>Filtrar conteúdos:</strong><br>
      8. Usar a barra de busca no feed<br>
      9. Inserir termo de pesquisa<br>
      10. Verificar resultados filtrados<br><br>
      <strong>Adicionar comentários:</strong><br>
      11. Clicar em um post do feed<br>
      12. Verificar abertura da sidebar de comentários<br>
      13. Digitar comentário no campo<br>
      14. Enviar comentário
      </td>
  </tr>
    <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>
      - Conteúdo criado no Strapi deve aparecer no feed<br>
      - Feed deve exibir título, autor, data e conteúdo das publicações<br>
      - Sistema deve filtrar conteúdos conforme busca<br>
      - Comentário deve ser salvo e aparecer na lista de comentários
    </td>
  </tr>
</table>

# Evidências de Testes de Software

A seguir estão apresentadas as evidências que comprovam o sucesso ou insucesso para cada caso de teste descrito na seção acima.

## Parte 1 - Testes de desenvolvimento

Testes realizados pelo próprio desenvolvedor responsável pela implementação do requisito.

### ETAPA 2

// TESTES PARA LOGIN, CADASTRO DE USUÁRIO E RECUPERAÇÃO DE SENHA

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

### ETAPA 4

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 <br>Permitir que o usuário altere seus dados.</th>
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
      <span>Colocar vídeo aqui</span> 
    </td>
  </tr>
</table>

### Responsável pelo desenvolvimento:

Lucas Guimarães

### Evidências:

- [x] Implementação do componente Feed com integração Strapi
- [x] Sistema de comentários com Convex backend
- [x] Funcionalidade de busca e filtro
- [x] Layout responsivo com sidebar para comentários

## Evidências de Teste - ETAPA 4

### Responsável pelos testes:

Matheus Castelliano

### Testes realizados:

- [ ] CT-010: Teste completo da funcionalidade de feed (RF-010)

## Parte 2 - Testes por pares

Testes realizados por um desenvolvedor terceiro, diferente daquele responsável pela implementação do requisito.

### ETAPA 2

// IMPLEMENTAR CASOS DE TESTE DE INSUCESSO PARA LOGIN, CADASTRO DE USUÁRIO E RECUPERAÇÃO DE SENHA

### ETAPA 3

<table>
  <tr>
    <th colspan="6" width="1000">CT-001<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve redirecionar o usuário para a página inicial do aplicativo após o login bem-sucedido.</td>
  </tr>
    <tr>
      <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">José da Silva </td>
      <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Maria Oliveira </td>
     <td width="100"><strong>Data do teste</strong></td>
    <td width="150">08/05/2024</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está permitindo o login corretamente.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><video src="https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2024-1-e5-proj-time-sheet/assets/82043220/2e3c1722-7adc-4bd4-8b4c-3abe9ddc1b48"/></td>
  </tr>
</table>

### ETAPA 4

Colocar evidências de teste da etapa 4
