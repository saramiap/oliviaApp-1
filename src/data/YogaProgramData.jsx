// yogaProgramData.js
export const yogaProgram = {
    title: "Parcours Yoga Sérénité",
    description: "Un programme de 7 jours pour cultiver le calme intérieur, la flexibilité et la pleine conscience grâce au yoga et à la méditation.",
    weeks: [ // Tu pourrais structurer par semaines si le programme est long, ou juste une liste de sessions
      {
        weekNumber: 1,
        title: "Fondations de la Calme",
        sessions: [
          {
            id: 'yoga_day1',
            day: 1,
            title: "Tonifier et assouplir tout le corps",
            focus: "Se reconnecter à son corps et à son souffle.",
            duration: "25 min", // Durée approximative
            videoId: "LxdxzRhgQwU", // Ou chemin vers une vidéo locale si tu les héberges
            videoType: "youtube", // ou "vimeo", "local"
            description: "Une séance douce pour commencer, axée sur des postures d'ancrage simples et une introduction à la respiration consciente (Pranayama). Idéal pour relâcher les tensions de la journée.",
            // Optionnel: points clés ou postures abordées
            keyPostures: ["Posture de l'enfant (Balasana)", "Chat-Vache (Marjaryasana-Bitilasana)", "Respiration Ujjayi (introduction)"],
          },
          {
            id: 'yoga_day2',
            day: 2,
            title: "Éveil Énergétique Matinal",
            focus: "Ramener le calme a toi.",
            duration: "26 min",
            videoId: "b4k23NgOafQ",
            videoType: "youtube",
            description: "Ramener le calme à l'interieur de toi. cette vidéo va etre basé sur la souplesse dans le bas du corps .",
            keyPostures: ["Salutation au Soleil (Surya Namaskar) adaptée", "Chien tête en bas (Adho Mukha Svanasana)", "Triangle (Trikonasana)"],
          },
          {
            id: 'yoga_day3',
            day: 3,
            title: "Routine yoga mobilité, force et souplesse",
            focus: "Ramener le calme a toi.",
            duration: "30 min",
            videoId: "UC6d9KeWA3o",
            videoType: "youtube",
            description: "Trouver du calme en son fort interieur.",
            keyPostures: ["Salutation au Soleil (Surya Namaskar) adaptée", "Chien tête en bas (Adho Mukha Svanasana)", "Triangle (Trikonasana)"],
          },
          {
            id: 'yoga_day4',
            day: 4,
            title: "Relacher les tensions et apaiser le mental",
            focus: "Ramener le calme a toi.",
            duration: "30 min",
            videoId: "v=ELhzaeE-n5s",
            videoType: "youtube",
            description: "Trouver du calme en son fort interieur.",
            keyPostures: ["Salutation au Soleil (Surya Namaskar) adaptée", "Chien tête en bas (Adho Mukha Svanasana)", "Triangle (Trikonasana)"],
          },
          {
            id: 'yoga_day5',
            day: 5,
            title: "Yoga flow créatif pour tout le corps",
            focus: "Ramener le calme a toi.",
            duration: "20 min",
            videoId: "KQYHbLq5LH8",
            videoType: "youtube",
            description: "Trouver du calme en son fort interieur.",
            keyPostures: ["Salutation au Soleil (Surya Namaskar) adaptée", "Chien tête en bas (Adho Mukha Svanasana)", "Triangle (Trikonasana)"],
          },
          {
            id: 'yoga_day6',
            day: 6,
            title: "Yoga du matin routine complète",
            focus: "Ramener le calme a toi.",
            duration: "25 min",
            videoId: "zxiY3mM95J0",
            videoType: "youtube",
            description: "Trouver du calme en son fort interieur.",
            keyPostures: ["Salutation au Soleil (Surya Namaskar) adaptée", "Chien tête en bas (Adho Mukha Svanasana)", "Triangle (Trikonasana)"],
          },
          {
            id: 'yoga_day7',
            day: 7,
            title: "Yoga du soir pour relacher les tensions",
            focus: "Intégrer la pleine conscience dans le mouvement et terminer par une relaxation profonde.",
            duration: "20 min",
            videoId: "RZg-Ou__uSo",
            videoType: "youtube",
            description: "Une séance fluide combinant des mouvements lents et conscients avec une méditation guidée et un Savasana (relaxation finale) prolongé.",
            keyPostures: ["Flux doux", "Postures assises méditatives", "Savasana guidé"],
          }
        ]
      },
      // Tu peux ajouter d'autres semaines ici
    ]
  };