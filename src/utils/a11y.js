/**
 * ♿ Acessibilidade (A11y) - Utilitários
 * 
 * Funções auxiliares para implementar acessibilidade em componentes
 */

/**
 * Props de acessibilidade para botões
 * @param {string} label - Descrição do botão para screen readers
 * @param {string} hint - Dica adicional (opcional)
 * @param {boolean} disabled - Se o botão está desabilitado
 */
export const buttonA11y = (label, hint = null, disabled = false) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'button',
  accessibilityState: { disabled, selected: false }
});

/**
 * Props de acessibilidade para inputs
 * @param {string} label - Label do campo
 * @param {string} hint - Dica de preenchimento
 * @param {boolean} required - Se o campo é obrigatório
 */
export const inputA11y = (label, hint = null, required = false) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint || (required ? 'Campo obrigatório' : null),
  accessibilityRole: 'text',
  accessibilityState: { disabled: false }
});

/**
 * Props de acessibilidade para alertas/notificações
 */
export const alertA11y = {
  accessible: true,
  accessibilityRole: 'alert',
  accessibilityLiveRegion: 'polite'
};

/**
 * Props de acessibilidade para links
 */
export const linkA11y = (label) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: 'link',
  accessibilityHint: 'Toque para navegar'
});

/**
 * Props de acessibilidade para tabs
 */
export const tabA11y = (label, selected = false) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: 'tab',
  accessibilityState: { selected }
});

/**
 * Descrever imagem para screen readers
 */
export const imageA11y = (description) => ({
  accessible: true,
  accessibilityLabel: description,
  accessibilityRole: 'image'
});

/**
 * Props para lista
 */
export const listA11y = (count) => ({
  accessible: true,
  accessibilityRole: 'list',
  accessibilityLabel: `Lista com ${count} itens`
});

/**
 * Props para item de lista
 */
export const listItemA11y = (position, total) => ({
  accessible: true,
  accessibilityRole: 'listitem',
  accessibilityLabel: `Item ${position} de ${total}`
});

export default {
  buttonA11y,
  inputA11y,
  alertA11y,
  linkA11y,
  tabA11y,
  imageA11y,
  listA11y,
  listItemA11y
};
