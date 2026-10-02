import { Aroma } from './types';

export const AROMAS_LIST: Aroma[] = [
  // Calma e redução de ansiedade
  { id: 'lavanda', name: 'Lavanda', category: 'Calma e redução de ansiedade', benefits: 'Reduz ansiedade e acalma mentes agitadas.', notes: 'Floral, Doce', intensity: 60, tags: ['Calma', 'Sono', 'Paz'], imageUrl: '/images/aromas/lavanda.jpg' },
  { id: 'camomila', name: 'Camomila', category: 'Calma e redução de ansiedade', benefits: 'Alivia irritação e tensão emocional.', notes: 'Doce, Herbáceo', intensity: 50, tags: ['Leveza', 'Relaxamento'], imageUrl: '/images/aromas/camomila.jpg' },
  { id: 'neroli', name: 'Neroli', category: 'Calma e redução de ansiedade', benefits: 'Auxilia em momentos de pânico e sobrecarga.', notes: 'Floral, Cítrico', intensity: 70, tags: ['Resgate', 'Equilíbrio'], imageUrl: '/images/aromas/neroli.jpg' },
  { id: 'melissa', name: 'Melissa', category: 'Calma e redução de ansiedade', benefits: 'Acalma angústia silenciosa.', notes: 'Cítrico, Herbáceo', intensity: 45, tags: ['Acolhimento', 'Suavidade'], imageUrl: '/images/aromas/melissa.jpg' },
  { id: 'sandalo', name: 'Sândalo', category: 'Calma e redução de ansiedade', benefits: 'Aquece e reduz pensamentos excessivos.', notes: 'Amadeirado, Terroso', intensity: 75, tags: ['Meditação', 'Presença'], imageUrl: '/images/aromas/sandalo.jpg' },
  { id: 'olibano', name: 'Olíbano (Frankincense)', category: 'Calma e redução de ansiedade', benefits: 'Auxilia contra o medo e inquietação.', notes: 'Resinoso, Toque Limão', intensity: 80, tags: ['Espiritualidade', 'Proteção'], imageUrl: '/images/aromas/olibano.jpg' },
  { id: 'manjerona', name: 'Manjerona', category: 'Calma e redução de ansiedade', benefits: 'Alivia o estresse acumulado.', notes: 'Quente, Herbáceo', intensity: 65, tags: ['Alívio', 'Descanso'], imageUrl: '/images/aromas/manjerona.jpg' },
  { id: 'cedro', name: 'Cedro', category: 'Calma e redução de ansiedade', benefits: 'Combate sensação de insegurança.', notes: 'Amadeirado, Seco', intensity: 70, tags: ['Estrutura', 'Segurança'], imageUrl: '/images/aromas/cedro.jpg' },

  // Tristeza e acolhimento emocional
  { id: 'bergamota', name: 'Bergamota', category: 'Tristeza e acolhimento emocional', benefits: 'Auxilia em tristezas leves e desânimo.', notes: 'Cítrico, Floral', intensity: 75, tags: ['Alegria', 'Confiança'], imageUrl: '/images/aromas/bergamota.jpg' },
  { id: 'rosa', name: 'Rosa', category: 'Tristeza e acolhimento emocional', benefits: 'Acolhe corações partidos e luto emocional.', notes: 'Floral Intenso', intensity: 90, tags: ['Amor', 'Consolo'], imageUrl: '/images/aromas/rosa.jpg' },
  { id: 'geranio', name: 'Gerânio', category: 'Tristeza e acolhimento emocional', benefits: 'Equilibra instabilidades emocionais.', notes: 'Floral, Verde', intensity: 80, tags: ['Equilíbrio', 'Feminilidade'], imageUrl: '/images/aromas/geranio.jpg' },
  { id: 'jasmim', name: 'Jasmim', category: 'Tristeza e acolhimento emocional', benefits: 'Preenche sensações de vazio.', notes: 'Floral Exótico', intensity: 95, tags: ['Beleza', 'Êxtase'], imageUrl: '/images/aromas/jasmim.jpg' },
  { id: 'ylangylang', name: 'Ylang-Ylang', category: 'Tristeza e acolhimento emocional', benefits: 'Alivia carência afetiva.', notes: 'Doce, Floral', intensity: 90, tags: ['Paixão', 'Autoestima'], imageUrl: '/images/aromas/ylangylang.jpg' },
  { id: 'palmarosa', name: 'Palmarosa', category: 'Tristeza e acolhimento emocional', benefits: 'Traz necessidade de conforto.', notes: 'Doce, Rosáceo', intensity: 60, tags: ['Carinho', 'Leveza'], imageUrl: '/images/aromas/palmarosa.jpg' },
  { id: 'mandarina', name: 'Mandarina', category: 'Tristeza e acolhimento emocional', benefits: 'Suaviza a melancolia.', notes: 'Cítrico Doce', intensity: 65, tags: ['Infância', 'Sorriso'], imageUrl: '/images/aromas/mandarina.jpg' },
  { id: 'laranja', name: 'Laranja-doce', category: 'Tristeza e acolhimento emocional', benefits: 'Eleva humor baixo.', notes: 'Cítrico, Fresco', intensity: 70, tags: ['Otimismo', 'Luz'], imageUrl: '/images/aromas/laranja.jpg' },

  // Energia e motivação
  { id: 'alecrim', name: 'Alecrim', category: 'Energia e motivação', benefits: 'Combate a fadiga mental.', notes: 'Herbáceo, Fresco', intensity: 80, tags: ['Ação', 'Vigor'], imageUrl: '/images/aromas/alecrim.jpg' },
  { id: 'hortela_pimenta', name: 'Hortelã-pimenta', category: 'Energia e motivação', benefits: 'Alivia cansaço e lentidão.', notes: 'Mentolado', intensity: 85, tags: ['Alerta', 'Frescor'], imageUrl: '/images/aromas/hortela_pimenta.jpg' },
  { id: 'limao', name: 'Limão', category: 'Energia e motivação', benefits: 'Combate falta de foco.', notes: 'Cítrico', intensity: 80, tags: ['Clareza', 'Impulso'], imageUrl: '/images/aromas/limao.jpg' },
  { id: 'grapefruit', name: 'Grapefruit', category: 'Energia e motivação', benefits: 'Combate a apatia.', notes: 'Cítrico, Amargo', intensity: 75, tags: ['Autoestima', 'Energia'], imageUrl: '/images/aromas/grapefruit.jpg' },
  { id: 'eucalipto', name: 'Eucalipto', category: 'Energia e motivação', benefits: 'Libera a mente “travada”.', notes: 'Cânforaceo', intensity: 85, tags: ['Respiro', 'Abertura'], imageUrl: '/images/aromas/eucalipto.jpg' },
  { id: 'gengibre', name: 'Gengibre', category: 'Energia e motivação', benefits: 'Traz impulso e coragem.', notes: 'Picante, Quente', intensity: 90, tags: ['Fogo', 'Determinação'], imageUrl: '/images/aromas/gengibre.jpg' },
  { id: 'pinho', name: 'Pinho', category: 'Energia e motivação', benefits: 'Alivia sensação de peso mental.', notes: 'Amadeirado, Resinoso', intensity: 70, tags: ['Força', 'Resiliência'], imageUrl: '/images/aromas/pinho.jpg' },
  { id: 'manjericao', name: 'Manjericão', category: 'Energia e motivação', benefits: 'Combate exaustão intelectual.', notes: 'Herbáceo, Doce', intensity: 75, tags: ['Mente', 'Renovação'], imageUrl: '/images/aromas/manjericao.jpg' },

  // Foco e clareza
  { id: 'alecrim_cineol', name: 'Alecrim qt cineol', category: 'Foco e clareza', benefits: 'Focado em concentração intensa.', notes: 'Herbáceo, Cânforaceo', intensity: 80, tags: ['Estudo', 'Memória'], imageUrl: '/images/aromas/alecrim_cineol.jpg' },
  { id: 'peppermint', name: 'Peppermint', category: 'Foco e clareza', benefits: 'Desperta mentes dispersas.', notes: 'Mentolado Forte', intensity: 90, tags: ['Lógica', 'Clarificação'], imageUrl: '/images/aromas/peppermint.jpg' },
  { id: 'louro', name: 'Louro', category: 'Foco e clareza', benefits: 'Traz decisão e clareza.', notes: 'Herbáceo, Doce', intensity: 75, tags: ['Vitória', 'Confiança'], imageUrl: '/images/aromas/louro.jpg' },
  { id: 'tea_tree', name: 'Tea Tree', category: 'Foco e clareza', benefits: 'Elimina confusão mental.', notes: 'Medicinal, Forte', intensity: 85, tags: ['Limpeza', 'Purificação'], imageUrl: '/images/aromas/tea_tree.jpg' },
  { id: 'lemongrass', name: 'Lemongrass', category: 'Foco e clareza', benefits: 'Promove recomeço mental.', notes: 'Cítrico, Herbáceo', intensity: 80, tags: ['Renovo', 'Início'], imageUrl: '/images/aromas/lemongrass.jpg' },
  
  // Tristeza e acolhimento emocional (continuado)
  { id: 'laranja_doce', name: 'Laranja-doce', category: 'Tristeza e acolhimento emocional', benefits: 'Eleva o humor e traz leveza.', notes: 'Cítrico, Doce', intensity: 75, tags: ['Alegria', 'Otimismo'], imageUrl: '/images/aromas/laranja_doce.jpg' },
  
  // Energia e motivação (continuado)
  { id: 'hortela_pimenta_energia', name: 'Hortelã-pimenta', category: 'Energia e motivação', benefits: 'Combate cansaço e lentidão.', notes: 'Mentolado', intensity: 90, tags: ['Energia', 'Alerta'], imageUrl: '/images/aromas/hortela_pimenta_energia.jpg' },
  
  // Confiança e autoestima
  { id: 'patchouli', name: 'Patchouli', category: 'Confiança e autoestima', benefits: 'Auxilia em momentos de insegurança.', notes: 'Terroso, Intenso', intensity: 90, tags: ['Pé no chão', 'Presença'], imageUrl: '/images/aromas/patchouli.jpg' },
  { id: 'vetiver', name: 'Vetiver', category: 'Confiança e autoestima', benefits: 'Traz estabilidade interna.', notes: 'Amadeirado, Úmido', intensity: 85, tags: ['Raiz', 'Foco'], imageUrl: '/images/aromas/vetiver.jpg' },
  { id: 'mirra', name: 'Mirra', category: 'Confiança e autoestima', benefits: 'Busca de força interior.', notes: 'Resinoso', intensity: 80, tags: ['Força', 'Resiliência'], imageUrl: '/images/aromas/mirra.jpg' },

  // Irritação e TPM
  { id: 'clary_sage', name: 'Clary Sage (Sálvia-esclareia)', category: 'Irritação e TPM', benefits: 'Alivia TPM e tensão hormonal.', notes: 'Herbáceo, Quente', intensity: 70, tags: ['Equilíbrio', 'Hormonal'], imageUrl: '/images/aromas/clary_sage.jpg' },
  { id: 'camomila_romana', name: 'Camomila romana', category: 'Irritação e TPM', benefits: 'Auxilia com raiva contida.', notes: 'Doce, Maçã', intensity: 60, tags: ['Paciência', 'Calma'], imageUrl: '/images/aromas/camomila_romana.jpg' },

  // Emoções profundas
  { id: 'baunilha', name: 'Baunilha', category: 'Emoções profundas', benefits: 'Necessidade de acolhimento e doçura.', notes: 'Doce, Quente', intensity: 85, tags: ['Acolhimento', 'Conforto'], imageUrl: '/images/aromas/baunilha.jpg' },
  { id: 'canela', name: 'Canela', category: 'Emoções profundas', benefits: 'Combate falta de entusiasmo pela vida.', notes: 'Especiado', intensity: 95, tags: ['Vibração', 'Entusiasmo'], imageUrl: '/images/aromas/canela.jpg' }
];
