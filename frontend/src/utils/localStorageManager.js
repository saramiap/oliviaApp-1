// src/utils/localStorageManager.js (exemple)

const USER_NAME_KEY = 'username'; // Clé utilisée dans Profile.js pour le nom
const LAST_ACTIVITIES_KEY = 'lastViewedActivities';
const MOOD_SUMMARY_KEY = 'moodSummary'; // Si tu implémentes le suivi d'humeur

// --- Gestion du Nom d'Utilisateur ---
export const getUserNameFromStorage = () => {
  return localStorage.getItem(USER_NAME_KEY) || "Cher·ère Utilisateur·rice"; // Nom par défaut
};

// --- Gestion des Dernières Activités ---
const MAX_LAST_ACTIVITIES = 3;

export const getLastActivitiesFromStorage = () => {
  const stored = localStorage.getItem(LAST_ACTIVITIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addActivityToStorage = (activity) => {
  // activity devrait être un objet comme : 
  // { id: 'unique_id_activite', type: 'Voyage Sonore', title: 'Forêt Sereine', route: '/detente/voyage-sonore', iconName: 'Headphones' (ou le composant icône direct) }
  if (!activity || !activity.id || !activity.route || !activity.title || !activity.type) {
    console.warn("Tentative d'ajout d'une activité invalide au stockage :", activity);
    return;
  }

  let activities = getLastActivitiesFromStorage();
  // Enlève l'activité si elle existe déjà pour la remettre en haut de la liste
  activities = activities.filter(act => act.id !== activity.id);
  // Ajoute la nouvelle activité au début
  activities.unshift(activity);
  // Limite le nombre d'activités stockées
  if (activities.length > MAX_LAST_ACTIVITIES) {
    activities = activities.slice(0, MAX_LAST_ACTIVITIES);
  }
  localStorage.setItem(LAST_ACTIVITIES_KEY, JSON.stringify(activities));
};

// --- Gestion du Résumé de l'Humeur (Exemple) ---
export const getMoodSummaryFromStorage = () => {
  const stored = localStorage.getItem(MOOD_SUMMARY_KEY);
  // Retourne une valeur par défaut si rien n'est trouvé ou si le format est incorrect
  const defaultMood = { mood: "Prêt·e à explorer", emoji: "✨", date: "" };
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Vérifie si les propriétés attendues sont présentes
      if (parsed && parsed.mood && parsed.emoji) {
        return parsed;
      }
    } catch (e) {
      console.error("Erreur parsing du résumé d'humeur depuis localStorage", e);
    }
  }
  return defaultMood;
};

export const saveMoodSummaryToStorage = (moodData) => {
  // moodData: { mood: "Content·e", emoji: "😊", date: "Aujourd'hui" }
  localStorage.setItem(MOOD_SUMMARY_KEY, JSON.stringify(moodData));
};