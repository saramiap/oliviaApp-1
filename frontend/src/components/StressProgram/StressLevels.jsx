// Dans StressProgramPage.js ou un fichier de données séparé

const stressLevels = {
    low: {
      title: 'Stress léger',
      description: 'Tu ressens une petite tension ou agitation. Ces exercices doux t\'aideront à te recentrer.',
      activities: [
        {
          id: 'low_breath_478',
          type: 'breathing', // Type d'activité
          componentType: 'BreathingExercise', // Nom du composant React à rendre
          title: 'Respiration 4-7-8',
          description: 'Une technique simple pour calmer rapidement le système nerveux. Inspire par le nez, expire par la bouche.',
          params: { // Paramètres spécifiques à cet exercice de respiration
            cycles: 3, // Nombre de cycles à faire
            inspire: 4, // Secondes
            hold: 7,    // Secondes
            expire: 8,  // Secondes
            instructions: [
              "Installe-toi confortablement, assise ou allongée.",
              "Ferme doucement les yeux si tu le souhaites.",
              "Expire complètement par la bouche en faisant un léger son \"whoosh\".",
              "Ferme la bouche et inspire calmement par le nez en comptant mentalement jusqu'à 4.",
              "Retiens ta respiration en comptant jusqu'à 7.",
              "Expire bruyamment par la bouche en comptant jusqu'à 8.",
              "Ceci est un cycle. Recommence pour le nombre de cycles indiqué."
            ]
          }
        },
        {
          id: 'low_quote',
          type: 'reading',
          componentType: 'QuoteDisplay',
          title: 'Pensée Inspirante',
          description: 'Laisse cette citation résonner en toi.',
          params: {
            quote: '"Chaque nouvelle aube est une nouvelle chance de respirer profondément, de recommencer et de se sentir vivant." - Oprah Winfrey',
            author: 'Oprah Winfrey (adapté)'
          }
        },
      ],
    },
    moderate: {
      title: 'Stress modéré',
      description: 'Tu te sens un peu dépassé(e). Ces outils t\'aideront à reprendre pied et à clarifier tes pensées.',
      activities: [
        {
          id: 'mod_coherence',
          type: 'breathing',
          componentType: 'CoherenceCardiac', // Composant spécifique pour la cohérence cardiaque
          title: 'Cohérence Cardiaque (3 min)',
          description: 'Synchronise ta respiration avec une animation visuelle pour harmoniser ton rythme cardiaque.',
          params: {
            duration: 180, // 3 minutes en secondes
            breathsPerMinute: 6, // Standard pour la cohérence (5s inspire, 5s expire)
            visualGuide: true // Indique qu'on a besoin d'une aide visuelle
          }
        },
        {
          id: 'mod_journal',
          type: 'writing',
          componentType: 'JournalingExercise',
          title: 'Journal de pensées structuré',
          description: 'Mettre des mots sur tes pensées peut t\'aider à prendre du recul et à trouver des solutions.',
          params: {
            prompt: "Prends un instant pour écrire librement ce qui te pèse en ce moment. Quelles sont les pensées ou situations qui génèrent ce stress modéré ? Essaie ensuite de trouver une petite action que tu pourrais entreprendre pour alléger l'une de ces sources de tension.",
            placeholder: "Écris ici tes pensées, tes préoccupations, tes idées...",
            saveOption: false // Pour l'instant, on ne sauvegarde pas dans le journal principal (mais on pourrait)
          }
        },
      ],
    },
    high: {
      title: 'Stress élevé',
      description: 'Tu es probablement surchargé(e). Ces techniques sont conçues pour t\'aider à t\'ancrer dans le présent et à envisager un soutien.',
      activities: [
        {
          id: 'high_grounding_54321',
          type: 'grounding',
          componentType: 'Grounding54321',
          title: "Exercice d'ancrage 5-4-3-2-1",
          description: 'Cette technique t\'aide à te reconnecter à tes sens et à l\'instant présent lorsque tout semble trop intense.',
          params: {
            steps: [
              { sense: "VOIR", instruction: "Nomme 5 choses que tu peux voir autour de toi.", count: 5 },
              { sense: "TOUCHER", instruction: "Prends conscience de 4 choses que tu peux sentir au toucher (tes vêtements, la chaise, tes mains...).", count: 4 },
              { sense: "ENTENDRE", instruction: "Identifie 3 sons que tu peux entendre, proches ou lointains.", count: 3 },
              { sense: "SENTIR (Odorat)", instruction: "Perçois 2 odeurs différentes.", count: 2 },
              { sense: "GOÛTER", instruction: "Prends conscience d'1 chose que tu peux goûter (le goût dans ta bouche, une gorgée d'eau...).", count: 1 }
            ]
          }
        },
        {
          id: 'high_support',
          type: 'support',
          componentType: 'SupportSuggestion',
          title: 'Envisager un Soutien Extérieur',
          description: 'Lorsque le stress est élevé et persistant, il est important de ne pas rester seul·e. Parler à un professionnel peut faire une grande différence.',
          params: {
            message: "Si tu te sens submergé·e de manière récurrente, ou si ce stress a un impact important sur ta vie quotidienne, n'hésite pas à en parler à ton médecin ou à rechercher un psychologue. Tu peux aussi consulter notre page de ressources d'urgence.",
            emergencyPageRoute: "/urgence" // Lien vers ta page d'urgence
          }
        },
      ],
    },
  };
  

  // export default stressLevels;