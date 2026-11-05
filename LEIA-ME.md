# Central de Manuais UAM

## Jeito mais fácil: Área do editor no próprio site

No fim da página do site, toque em **Área do editor** e cole o seu código de acesso do GitHub.
Depois disso aparecem o quadro "Adicionar manual", os botões de trocar foto/logo, as setas de ordem e o botão Remover.

Para criar o código (uma vez só): github.com/settings/personal-access-tokens/new
- Repository access: Only select repositories → este repositório
- Permissions → Repository permissions → Contents: Read and write
- Gere e copie o código (começa com `github_pat_`). Ele fica guardado só no aparelho onde você colar.

Site com manuais e guias rápidos dos equipamentos, publicado pelo GitHub Pages.

## Como adicionar um manual ou guia

1. Abra a pasta `manuais/` aqui no GitHub e entre na pasta da categoria (por exemplo `Tratores`).
2. Clique em **Add file → Upload files**, arraste o PDF (até 25 MB) e clique em **Commit changes**.
3. Em 1 ou 2 minutos o site atualiza sozinho.

**Nome do arquivo:**
- Manual: `Manual - Trator 6110J (John Deere).pdf`
- Guia rápido: `Guia rápido - Trator 6110J (John Deere).pdf`

O que vem depois do traço é o nome que aparece no site. Arquivo que começa com "Guia" aparece como Guia rápido.

## Nova categoria

Crie uma pasta nova dentro de `manuais/` (no upload, escreva `manuais/Plantadeiras/` antes do nome do arquivo).
Para a foto do cartão, coloque uma imagem chamada `foto.jpg` dentro da pasta.

## Logo

Envie uma imagem chamada `logo.png` na raiz do repositório e ela aparece no topo do site.

## PDF maior que 25 MB

Comprima antes em ilovepdf.com (Comprimir PDF).

## Ordem dos cartões

Edite o arquivo `manuais/ordem.txt` (lápis no GitHub): uma categoria por linha, na ordem que quiser.

## Foto da faixa

Troque o arquivo `img/hero.jpg` por outra imagem com o mesmo nome.
