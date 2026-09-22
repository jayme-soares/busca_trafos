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
