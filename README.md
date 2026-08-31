# Busca de Trafos

App web (Next.js) para buscar um ou vários trafos pelo código e visualizar a
localização em um mapa próprio (Leaflet + OpenStreetMap, sem chave de API).

## Funcionalidades

- Busca de um ou vários códigos de trafo de uma vez (separados por vírgula,
  espaço ou quebra de linha — dá pra colar uma coluna inteira copiada de uma
  planilha).
- Match exato pelo código; se não achar exato, tenta correspondência parcial
  (contém o texto digitado).
- Mapa renderizado na própria tela (Leaflet), com um marcador por trafo
  encontrado; a área do mapa se ajusta automaticamente aos resultados.
- Lista de resultados com as coordenadas em texto; clicar num item da lista
  destaca e centraliza o marcador correspondente no mapa.
- Botão "Google Maps" em cada resultado, que abre aquele ponto direto no
  Google Maps (`google.com/maps?q=lat,lng`).
- Quando há mais de um resultado, um link "Abrir rota com todos no Google
  Maps" monta uma rota passando por todos os pontos encontrados.
- Códigos não encontrados são listados separadamente.

## Fonte dos dados

Os dados vêm de `base_trafos.xlsx` (planilha com `name`, `latitude`,
`longitude`, `coordinates`). Essa planilha mistura transformadores (pontos)
com trechos de rede elétrica (linhas, com nome começando por "Track" — sem
lat/lon únicos, por isso são ignorados aqui).

O script `scripts/convert-xlsx.mjs` lê o `.xlsx`, filtra só os registros de
trafo (ponto único com lat/lon válidos), remove duplicatas exatas e gera
`data/trafos.json`, que é o arquivo que o app efetivamente usa em runtime.

**Para atualizar os dados** (nova planilha, trafos novos, etc.):

1. Substitua `base_trafos.xlsx` na raiz do projeto.
2. Rode:

```bash
npm run data:build
```

3. Confira o resultado em `data/trafos.json` e faça commit/deploy normalmente.

> O app não lê o `.xlsx` em runtime — só o JSON gerado. Isso mantém o app
> leve e rápido tanto local quanto no Vercel.

## Rodando localmente

```bash
npm install
npm run data:build   # gera data/trafos.json a partir do xlsx (só precisa rodar 1x, ou quando a planilha mudar)
npm run dev
```

Abra http://localhost:3000.

## Deploy no Vercel

1. Suba este projeto para um repositório Git (GitHub/GitLab/Bitbucket).
2. Em https://vercel.com, clique em "Add New… → Project" e importe o
   repositório.
3. O Vercel detecta automaticamente que é um projeto Next.js — não é preciso
   configurar nada além disso (sem variáveis de ambiente, sem chave de API).
4. Deploy.

Se quiser fazer via CLI:

```bash
npm i -g vercel
vercel
```

`data/trafos.json` já vai commitado no repositório (é gerado a partir do
`.xlsx` antes do deploy), então o build no Vercel não depende do arquivo
Excel nem de rodar `data:build` no servidor.

## Notas técnicas / limitações conhecidas

- Os tiles do mapa vêm do servidor público do OpenStreetMap
  (`tile.openstreetmap.org`). Para uso com tráfego alto/produção séria,
  considere um provedor de tiles próprio ou comercial (Mapbox, MapTiler,
  etc.), respeitando a [política de uso do OSM](https://operations.osmfoundation.org/policies/tiles/).
- O link "Abrir no Google Maps" e a "rota com todos" não exigem chave de API
  do Google — usam apenas URLs públicas (`google.com/maps?q=` e
  `google.com/maps/dir/`), então abrem direto no navegador/app do usuário.
- A rota com todos os pontos é limitada a 23 paradas (limite prático da
  interface do Google Maps); se a busca trouxer mais resultados que isso,
  só os primeiros 23 entram na URL de rota (a lista e o mapa continuam
  mostrando todos).
- A dependência `xlsx` (SheetJS) é usada **só no script de conversão**
  (`npm run data:build`), não faz parte do bundle do app publicado — ela tem
  avisos de segurança conhecidos (prototype pollution / ReDoS) que não têm
  correção oficial ainda, mas como só processa um arquivo local controlado
  por você (não input de usuário via web), o risco no fluxo deste projeto é
  baixo.
