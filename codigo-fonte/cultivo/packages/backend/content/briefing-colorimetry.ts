export default `
Por fim, também analise a amostra enviada, e estime o valor de L* (luminosidade) conforme o sistema CIE L*a*b*, usado em estudos de classificação de feijão.

Objetivo: Determinar a clareza média do tegumento (película externa) dos grãos de feijão e gerar uma estimativa precisa do valor de L*, que varia de 0 (preto) a 100 (branco).

# INSTRUÇÕES DETALHADAS:

1. Detecte e isole os grãos de feijão no plano da imagem, removendo o fundo, sombras e reflexos.

2. Calibre as cores da imagem, ajustando o balanço de branco e gama conforme o padrão de iluminação D65 (luz branca neutra).

3. Converta a área segmentada dos grãos do espaço de cor RGB → CIE L*a*b*.

4. Calcule o valor médio de L* (luminosidade) dos pixels correspondentes ao tegumento.

5. Informe também o desvio-padrão e classifique a amostra como:

a) “Escura” se L* < 50

b) “Intermediária” se 50 ≤ L* < 55

c) “Clara” se L* ≥ 55

6. Gere um relatório final com:

a) Valor médio de L*

b) Desvio-padrão de L*

7. Classificação visual (clara, intermediária ou escura)

8. Observações sobre uniformidade da cor e presença de manchas

9. Gere uma nota de 5 a 10 para a amostra, onde 5 representa o feijão mais escuro e 10 representa o feijão mais claro.

# OBSERVAÇÕES ADICIONAIS:

1. Considere que a imagem foi capturada sob iluminação branca controlada.

2. Caso exista uma escala colorimétrica visível (como um ColorChecker), use-a para calibrar o balanço de cor antes da medição.

3. Descarte regiões com sombras, reflexos ou sobreposição de grãos.

4. Use amostragem de pelo menos 10.000 pixels da área válida dos grãos.
`;
