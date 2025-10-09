# Planos de Testes de Software

A seguir estão descritos todos os casos de teste de sucesso e insucesso que cobrem o sistema.

### ETAPA 2

// DESCREVER CASOS DE TESTE DE SUCESSO PARA LOGIN, CADASTRO DE USUÁRIO E RECUPERAÇÃO DE SENHA

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
      1. Abrir o website.<br>
      2. Realizar o login na plataforma (com qualquer tipo de usuário).<br>
      3. Ao ser redirecionado para o painel principal, clicar no botão "Classificar Amostra"<br>
      4. Fazer upload de um arquivo de imagem no local indicado.
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

### ETAPA 4

Criar casos de teste da etapa 4

# Evidências de Testes de Software

A seguir estão apresentadas as evidências que comprovam o sucesso ou insucesso para cada caso de teste descrito na seção acima.

## Parte 1 - Testes de desenvolvimento

Testes realizados pelo próprio desenvolvedor responsável pela implementação do requisito.

### ETAPA 2

// TESTES PARA LOGIN, CADASTRO DE USUÁRIO E RECUPERAÇÃO DE SENHA

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

### ETAPA 4

Colocar evidências de teste da etapa 4

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
