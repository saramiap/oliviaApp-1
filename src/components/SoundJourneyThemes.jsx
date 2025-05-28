// soundJourneyThemes.js (ou directement dans le composant)
export const soundJourneyThemes = [
    {
      id: 'forest_serenity',
      title: 'Forêt Sereine',
      description: 'Laissez-vous envelopper par les murmures de la forêt, le chant des oiseaux et le bruissement des feuilles.',
      backgroundImage: '/images/soundjourneys/forest.jpg', // Image de fond pour ce thème
      audioTracks: [
        { src: '/audio/forest_ambience.mp3', volume: 0.8, loop: true }, // Piste principale
        { src: '/audio/bird_songs_gentle.mp3', volume: 0.6, loop: true, delay: 2000 }, // Piste secondaire avec un léger délai
      ],
      oliviaIntro: "Installez-vous confortablement. Fermez les yeux et laissez les sons de la forêt vous apaiser...",
      oliviaOutro: "Revenez doucement à vous, en emportant cette sérénité. Quand vous serez prêt·e, ouvrez les yeux."
    },
    {
      id: 'ocean_calm',
      title: 'Vagues Apaisantes',
      description: 'Le rythme régulier des vagues pour une relaxation profonde et un esprit clair.',
      backgroundImage: '/images/soundjourneys/ocean.jpg',
      audioTracks: [
        { src: '/audio/ocean_waves_calm.mp3', volume: 0.9, loop: true },
        { src: '/audio/seagulls_distant.mp3', volume: 0.3, loop: true, delay: 5000 },
      ],
      oliviaIntro: "Imaginez-vous au bord de l'océan. Sentez la brise, écoutez le va-et-vient des vagues...",
      oliviaOutro: "Gardez cette sensation de calme et d'espace en vous. Revenez à votre rythme."
    },
    {
      id: 'cosmic_drift',
      title: 'Dérive Cosmique',
      description: 'Un voyage sonore à travers l\'immensité tranquille de l\'espace, pour une détente méditative.',
      backgroundImage: '/images/soundjourneys/cosmos.jpg',
      audioTracks: [
        { src: '/audio/space_ambient_drone.mp3', volume: 0.7, loop: true },
        { src: '/audio/space_chimes_subtle.mp3', volume: 0.5, loop: true, delay: 3000 },
      ],
      oliviaIntro: "Préparez-vous pour un voyage au cœur des étoiles. Laissez votre esprit s'étendre dans l'immensité...",
      oliviaOutro: "Revenez doucement sur Terre, avec une nouvelle perspective. Prenez une grande inspiration."
    },
    // Ajoute d'autres thèmes
  ];