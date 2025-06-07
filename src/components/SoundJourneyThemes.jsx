// soundJourneyThemes.js (ou directement dans le composant)
export const soundJourneyThemes = [
    {
      id: 'forest_serenity',
      title: 'Forêt Sereine',
      description: 'Laissez-vous envelopper par les murmures de la forêt, le chant des oiseaux et le bruissement des feuilles.',
      backgroundImage: '/public/soundJourneyImage/foret.jpg', // Image de fond pour ce thème
      audioTracks: [
        { src: '/public/audio/nature-ambience.mp3', volume: 0.8, loop: true }, // Piste principale
        { src: '/public/audio/relaxation-music-fond.mp3', volume: 0.6, loop: true, delay: 2000 }, // Piste secondaire avec un léger délai
      ],
      oliviaIntro: "Installez-vous confortablement. Fermez les yeux et laissez les sons de la forêt vous apaiser...",
      oliviaOutro: "Revenez doucement à vous, en emportant cette sérénité. Quand vous serez prêt·e, ouvrez les yeux."
    },
    {
      id: 'ocean_calm',
      title: 'Vagues Apaisantes',
      description: 'Le rythme régulier des vagues pour une relaxation profonde et un esprit clair.',
      backgroundImage: '/public/soundJourneyImage/la-mer.jpg',
      audioTracks: [
        { src: '/public/audio/ocean-beach-waves-332383.mp3', volume: 0.9, loop: true },
        { src: '/public/audio/relaxation-music-fond.mp3', volume: 0.6, loop: true, delay: 5000 },
      ],
      oliviaIntro: "Imaginez-vous au bord de l'océan. Sentez la brise, écoutez le va-et-vient des vagues...",
      oliviaOutro: "Gardez cette sensation de calme et d'espace en vous. Revenez à votre rythme."
    },
    {
      id: 'sea_drift',
      title: 'A la dérive',
      description: 'Un voyage sonore à travers l\'immensité tranquille de la mer, pour une détente méditative.',
      backgroundImage: '/public/soundJourneyImage/patoger-dans-leau.jpg',
      audioTracks: [
        { src: '/public/audio/bruit-de-leau.mp3', volume: 0.7, loop: true },
        { src: '/public/audio/relaxation-music-fond.mp3', volume: 0.9, loop: true, delay: 3000 },
      ],
      oliviaIntro: "Préparez-vous pour un voyage au cœur de la mer. Laissez votre esprit s'étendre dans l'immensité...",
      oliviaOutro: "Revenez doucement sur Terre, avec une nouvelle perspective. Prenez une grande inspiration."
    },
    {
        id: 'relaxation',
        title: 'relaxation extreme',
        description: 'Un voyage sonore à travers le temps, pour une détente méditative.',
        backgroundImage: '/public/soundJourneyImage/relaxation.jpg',
        audioTracks: [
          { src: '/public/audio/autumn-sky-meditation-7618.mp3', volume: 0.7, loop: true },
          { src: '/public/audio/relaxation-music-fond.mp3', volume: 0.5, loop: true, delay: 3000 },
        ],
        oliviaIntro: "Préparez-vous pour un voyage au cœur des étoiles. Laissez votre esprit s'étendre dans l'immensité...",
        oliviaOutro: "Revenez doucement sur Terre, avec une nouvelle perspective. Prenez une grande inspiration."
      },
      {
        id: 'pluie-relaxante',
        title: 'pluie relaxante',
        description: 'Un voyage sonore à travers le temps, pour une détente méditative.',
        backgroundImage: '/public/soundJourneyImage/pluie-relaxante.jpg',
        audioTracks: [
          { src: '/public/audio/gentle-rain-for-relaxation-and-sleep-337279.mp3', volume: 0.7, loop: true },
          { src: '/public/audio/relaxation-music-fond.mp3', volume: 0.5, loop: true, delay: 3000 },
        ],
        oliviaIntro: "Préparez-vous pour un voyage au cœur des étoiles. Laissez votre esprit s'étendre dans l'immensité...",
        oliviaOutro: "Revenez doucement sur Terre, avec une nouvelle perspective. Prenez une grande inspiration."
      },
  ];