/**
 * Dados globais da marca. Tudo aqui é fictício: o projeto é demonstrativo.
 * Os contatos usam destinos inofensivos (DDD 00 inexistente e domínio reservado .example).
 */
export const site = {
  name: 'Terapia Zen',
  isDemo: true,
  foundedYear: 2026,
  contact: {
    whatsapp: {
      label: '+55 (00) 90000-0000',
      href: 'https://wa.me/5500900000000',
    },
    email: {
      label: 'ola@terapiazen.example',
      href: 'mailto:ola@terapiazen.example',
    },
    instagram: {
      label: '@terapiazen.demo',
      // Perfil fictício: aponta para a página inicial do Instagram, não para uma conta real.
      href: 'https://www.instagram.com/',
    },
  },
} as const;
