/**
 * Copia texto para a área de transferência. Usa a Clipboard API quando
 * disponível (contexto seguro / https / localhost) e cai para o truque do
 * textarea + execCommand em navegadores/contexto sem suporte.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Tenta primeiro o método clássico: roda de forma síncrona, dentro do
  // gesto de clique do usuário, e não depende de permissão de navegador
  // (a Clipboard API abaixo pode ser bloqueada por política de permissões
  // em alguns contextos, mesmo em página https normal).
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (ok) return true;
  } catch {
    // segue para o fallback moderno
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // nenhum dos dois métodos funcionou
    }
  }

  return false;
}
